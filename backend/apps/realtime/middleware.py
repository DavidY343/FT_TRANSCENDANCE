from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.backends import TokenBackend
from channels.db import database_sync_to_async
import logging
from urllib.parse import parse_qs
import inspect
from http.cookies import SimpleCookie

User = get_user_model()

logger = logging.getLogger(__name__)


@database_sync_to_async
def get_user_by_id(user_id):
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return None


class TokenAuthMiddleware:
    """ASGI middleware that authenticates WebSocket connections using
    an Authorization: Bearer <token> header decoded by SimpleJWT's
    TokenBackend.

    Usage in `config/asgi.py`:
        from apps.realtime.middleware import TokenAuthMiddleware
        application = ProtocolTypeRouter({
            "http": get_asgi_application(),
            "websocket": TokenAuthMiddleware(URLRouter(...)),
        })
    """

    def __init__(self, inner):
        self.inner = inner

    def __call__(self, scope, receive=None, send=None):
        """Return an instance when called with only scope, or behave as an
        ASGI application when called with (scope, receive, send).
        """
        inst = TokenAuthMiddlewareInstance(scope, self)
        if receive is None and send is None:
            return inst
        return inst(receive, send)


class TokenAuthMiddlewareInstance:
    def __init__(self, scope, middleware):
        self.scope = dict(scope)
        self.inner = middleware.inner

    async def __call__(self, receive, send):
        # Default to AnonymousUser
        self.scope['user'] = AnonymousUser()

        # Extract Authorization header from scope
        headers = dict(self.scope.get('headers', []))
        auth_header = None
        # headers keys are bytes
        auth_header = headers.get(b'authorization')
        token = None
        if auth_header:
            try:
                auth_text = auth_header.decode()
                if auth_text.startswith('Bearer '):
                    token = auth_text.split(' ', 1)[1].strip()
            except Exception:
                token = None

        if token:
            try:
                token_backend = TokenBackend(
                    algorithm=settings.SIMPLE_JWT.get('ALGORITHM', 'HS256'),
                    signing_key=settings.SECRET_KEY,
                )
                validated = token_backend.decode(token, verify=True)
                user_id = validated.get('user_id') or validated.get('user')
                if user_id:
                    user = await get_user_by_id(user_id)
                    if user:
                        self.scope['user'] = user
                        logger.debug('WebSocket auth success for user_id=%s', user_id)
                    else:
                        logger.info('WebSocket token valid but user not found: %s', user_id)
            except Exception as e:
                # leave AnonymousUser on any error
                logger.info('WebSocket auth failed during token decode: %s', e)
                self.scope['user'] = AnonymousUser()
        else:
            # Try to authenticate from cookies (access or refresh) - browsers send cookies automatically
            try:
                cookie_header = headers.get(b'cookie')
                if cookie_header:
                    cookie_str = cookie_header.decode()
                    cookie = SimpleCookie()
                    cookie.load(cookie_str)
                    # prefer access cookie, fallback to refresh cookie
                    if 'access' in cookie:
                        qtoken = cookie['access'].value
                    elif 'refresh' in cookie:
                        qtoken = cookie['refresh'].value
                    else:
                        qtoken = None
                    if qtoken:
                        try:
                            token_backend = TokenBackend(
                                algorithm=settings.SIMPLE_JWT.get('ALGORITHM', 'HS256'),
                                signing_key=settings.SECRET_KEY,
                            )
                            validated = token_backend.decode(qtoken, verify=True)
                            user_id = validated.get('user_id') or validated.get('user')
                            if user_id:
                                user = await get_user_by_id(user_id)
                                if user:
                                    self.scope['user'] = user
                                    logger.debug('WebSocket auth success via cookie for user_id=%s', user_id)
                        except Exception as e:
                            logger.info('WebSocket cookie auth failed: %s', e)
            except Exception:
                # swallow cookie parsing errors
                pass

            # Development fallback: if DEBUG, accept token from querystring for convenience
            if getattr(settings, 'DEBUG', False):
                qs = self.scope.get('query_string', b'').decode()
                params = parse_qs(qs)
                token_list = params.get('token') or params.get('access') or []
                qtoken = token_list[0] if token_list else None
                if qtoken:
                    try:
                        token_backend = TokenBackend(
                            algorithm=settings.SIMPLE_JWT.get('ALGORITHM', 'HS256'),
                            signing_key=settings.SECRET_KEY,
                        )
                        validated = token_backend.decode(qtoken, verify=True)
                        user_id = validated.get('user_id') or validated.get('user')
                        if user_id:
                            user = await get_user_by_id(user_id)
                            if user:
                                self.scope['user'] = user
                                logger.debug('WebSocket auth success via querystring for user_id=%s', user_id)
                    except Exception as e:
                        logger.info('WebSocket querystring auth failed: %s', e)

        # Call the inner application using its declared signature.
        # Standard ASGI apps expect (scope, receive, send).
        try:
            signature = inspect.signature(self.inner)
            if len(signature.parameters) == 1:
                inner = self.inner(self.scope)
                return await inner(receive, send)
        except (TypeError, ValueError):
            # If signature inspection fails, fall back to standard ASGI call.
            pass

        return await self.inner(self.scope, receive, send)

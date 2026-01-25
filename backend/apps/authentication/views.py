from tokenize import TokenError
from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from django.contrib.auth import authenticate, get_user_model
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.conf import settings
from urllib.parse import urlparse
from .serializers import RegisterSerializer, LoginSerializer

# Obtiene TU modelo User personalizado (con UUID)
User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Tu USERNAME_FIELD = "username", así que autentica con username
        user = authenticate(
            username=serializer.validated_data["username"],
            password=serializer.validated_data["password"],
        )

        if not user:
            return Response(
                {"detail": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        refresh = RefreshToken.for_user(user)

        # Build response payload (access in body; refresh set as HttpOnly cookie)
        data = {
            "access": str(refresh.access_token),
            "user": {  # Añade info del usuario en la respuesta
                "id": str(user.id),  # UUID convertido a string
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
            }
        }

        response = Response(data, status=status.HTTP_200_OK)

        # Set HttpOnly refresh cookie. Lifetime taken from SIMPLE_JWT REFRESH_TOKEN_LIFETIME
        cookie_value = str(refresh)
        # compute max_age in seconds from settings
        try:
            lifetime = settings.SIMPLE_JWT.get("REFRESH_TOKEN_LIFETIME")
            max_age = int(getattr(lifetime, "total_seconds", lambda: None)() or 0)
        except Exception:
            max_age = None

        secure = not bool(getattr(settings, "DEBUG", False))

        response.set_cookie(
            key="refresh",
            value=cookie_value,
            httponly=True,
            samesite="Lax",
            secure=secure,
            path="/",
            max_age=max_age,
        )

        return response
    

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Accept refresh token from request body or cookie
            refresh_token = request.data.get("refresh") or request.COOKIES.get("refresh")
            if not refresh_token:
                return Response(
                    {"error": "Refresh token required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            token = RefreshToken(refresh_token)
            
            # IMPORTANTE: Tu user.id es UUID, convertir ambos a string para comparar
            if str(token.payload.get('user_id')) != str(request.user.id):
                return Response(
                    {"error": "Token does not belong to user"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            token.blacklist()
            response = Response(
                {"message": "Successfully logged out"},
                status=status.HTTP_200_OK
            )

            # Remove refresh cookie if present
            if request.COOKIES.get("refresh"):
                response.delete_cookie("refresh", path="/")

            return response
            
        except TokenError as e:
            return Response(
                {"error": f"Invalid refresh token: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )


class RefreshView(APIView):
    """Refresh access token.

    Accepts the refresh token from cookie `refresh` (preferred for browsers) or
    from the POST body as `refresh`. Performs a minimal Origin/Referer check
    when `DEBUG` is False.
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # Minimal Origin check: if DEBUG is False and Origin/Referer provided, ensure host matches
        origin = request.headers.get("Origin") or request.headers.get("Referer")
        if origin and not bool(getattr(settings, "DEBUG", False)):
            try:
                origin_host = urlparse(origin).netloc
                if origin_host and origin_host != request.get_host():
                    return Response({"error": "Mismatched Origin"}, status=status.HTTP_403_FORBIDDEN)
            except Exception:
                return Response({"error": "Invalid Origin"}, status=status.HTTP_400_BAD_REQUEST)

        refresh_token = request.data.get("refresh") or request.COOKIES.get("refresh")
        if not refresh_token:
            return Response({"error": "Refresh token required"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = TokenRefreshSerializer(data={"refresh": refresh_token})
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            return Response({"error": "Invalid refresh token"}, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data

        response = Response({"access": data.get("access")}, status=status.HTTP_200_OK)

        # If the serializer returned a new refresh (rotation), set it as cookie
        new_refresh = data.get("refresh")
        if new_refresh:
            try:
                lifetime = settings.SIMPLE_JWT.get("REFRESH_TOKEN_LIFETIME")
                max_age = int(getattr(lifetime, "total_seconds", lambda: None)() or 0)
            except Exception:
                max_age = None
            secure = not bool(getattr(settings, "DEBUG", False))
            response.set_cookie(
                key="refresh",
                value=new_refresh,
                httponly=True,
                samesite="Lax",
                secure=secure,
                path="/",
                max_age=max_age,
            )

        return response
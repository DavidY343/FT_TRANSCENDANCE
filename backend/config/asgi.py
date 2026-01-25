"""
ASGI config for config project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/asgi/
"""

import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
# Initialize Django apps registry before importing app modules that access
# Django models or settings (TokenAuthMiddleware imports auth models).
django.setup()

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from apps.realtime.middleware import TokenAuthMiddleware
from apps.realtime import routing as realtime_routing

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    # Use TokenAuthMiddleware to populate scope['user'] from Authorization header
    "websocket": TokenAuthMiddleware(URLRouter(realtime_routing.websocket_urlpatterns)),
})

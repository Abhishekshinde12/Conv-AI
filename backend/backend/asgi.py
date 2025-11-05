"""
ASGI config for backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from chat.routing import websocket_urlpatterns
from chat.security import JWTAuthMiddleware


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

django_asgi_app = get_asgi_application()

# In postman - need to manually pass the origin header with the origin in order to connect to the socket
# if we are using AllowedHostsOriginValidator here
application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket":JWTAuthMiddleware(
            URLRouter(websocket_urlpatterns)
        )
    }
)
"""
ASGI config for game project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter, ChannelNameRouter
from channels.auth import AuthMiddlewareStack
from game_app.routing import websocket_urlpatterns
from game_app.consumers import LocalGameConsumer
import signal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'game.settings')
application =  ProtocolTypeRouter(
	{
		"http" : get_asgi_application(),
  		"websocket": AuthMiddlewareStack(URLRouter(websocket_urlpatterns)),
		"channel": ChannelNameRouter({"local_engine": LocalGameConsumer.as_asgi()}),
	}
)

# Handle shutdown signals (SIGTERM, SIGINT)
def handle_exit(*args):
    print("Gracefully shutting down...")
    # Perform any cleanup here (if necessary)
    exit(0)

signal.signal(signal.SIGTERM, handle_exit)
"""
ASGI config for game project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'game.settings')

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter, ChannelNameRouter
from channels.auth import AuthMiddlewareStack
import signal
import django

django.setup()

from .routing import websocket_urlpatterns
from pong_local_app.consumers import PongLocalGameConsumer
from pong_remote_app.consumers import PongRemoteGameConsumer
from c4_local_app.consumers import C4LocalGameConsumer

django_asgi_app = get_asgi_application()

application =  ProtocolTypeRouter(
	{
		"http" : django_asgi_app,
  		"websocket": AuthMiddlewareStack(URLRouter(websocket_urlpatterns)),
		"channel": ChannelNameRouter({"pong_local_engine": PongLocalGameConsumer.as_asgi(),
                                "pong_remote_engine": PongRemoteGameConsumer.as_asgi(),
                                "c4_local_engine": C4LocalGameConsumer.as_asgi()})
	}
)

def handle_exit(*args):
    exit(0)

signal.signal(signal.SIGTERM, handle_exit)
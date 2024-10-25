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

from game_app.urls import urlpatterns
from game_app.routing import websocket_urlpatterns
from game_app.consumers import LocalGameConsumer
from game_app.consumers_remote import RemoteGameConsumer

django_asgi_app = get_asgi_application()

application =  ProtocolTypeRouter(
	{
		"http" : django_asgi_app,
  		"websocket": AuthMiddlewareStack(URLRouter(websocket_urlpatterns)),
		"channel": ChannelNameRouter({"local_engine": LocalGameConsumer.as_asgi(),
                                "remote_engine": RemoteGameConsumer.as_asgi()})
	}
)

def handle_exit(*args):
    exit(0)

signal.signal(signal.SIGTERM, handle_exit)
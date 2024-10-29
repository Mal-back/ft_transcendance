from django.urls import re_path
from .consumers import RemotePlayerConsumer

websocket_urlpatterns = [
 	re_path(r'^api/game/pong-remote/join/$', RemotePlayerConsumer.as_asgi()),
]
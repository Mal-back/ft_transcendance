from django.urls import re_path
from .consumers import PongRemotePlayerConsumer

websocket_urlpatterns = [
 	re_path(r'^api/game/pong-remote/join/$', PongRemotePlayerConsumer.as_asgi()),
]
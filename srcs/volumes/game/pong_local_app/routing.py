from django.urls import re_path
from .consumers import PongLocalPlayerConsumer

websocket_urlpatterns = [
	re_path(r'^api/game/pong-local/join/$', PongLocalPlayerConsumer.as_asgi()),
]
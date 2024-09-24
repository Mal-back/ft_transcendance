from django.urls import re_path, path
from .consumers import PlayerConsumer

websocket_urlpatterns = [
	re_path(r'^api/game/ws/$', PlayerConsumer.as_asgi()),
]
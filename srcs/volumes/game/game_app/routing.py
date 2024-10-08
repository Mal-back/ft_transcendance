from django.urls import re_path
from .consumers import LocalPlayerConsumer

websocket_urlpatterns = [
	re_path(r'^api/game/ws/(?P<room_name>\w+)$', LocalPlayerConsumer.as_asgi()),
]
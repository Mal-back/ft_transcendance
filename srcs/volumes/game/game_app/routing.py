from django.urls import re_path
from .consumers import LocalPlayerConsumer

websocket_urlpatterns = [
	re_path(r'^api/game/ws/$', LocalPlayerConsumer.as_asgi()),
]
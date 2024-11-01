from django.urls import re_path
from .consumers import C4LocalPlayerConsumer

websocket_urlpatterns = [
	re_path(r'^api/game/c4-local/join/$', C4LocalPlayerConsumer.as_asgi()),
]
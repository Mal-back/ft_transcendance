from django.urls import re_path
from .consumers import C4RemotePlayerConsumer

websocket_urlpatterns = [
 	re_path(r'^api/game/c4-remote/join/$', C4RemotePlayerConsumer.as_asgi()),
]
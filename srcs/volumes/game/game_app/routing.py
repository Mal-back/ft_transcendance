from django.urls import re_path
from .consumers import LocalPlayerConsumer
from .consumers_remote import RemotePlayerConsumer

websocket_urlpatterns = [
	re_path(r'^api/game/ws/$', LocalPlayerConsumer.as_asgi()),
 	re_path(r'^api/game/ws/remote/$', RemotePlayerConsumer.as_asgi()),
]
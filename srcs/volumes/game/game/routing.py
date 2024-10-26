from django.urls import path, include
import pong_local_app.routing
import pong_remote_app.routing

websocket_urlpatterns = [
    *pong_local_app.routing.websocket_urlpatterns,
    *pong_remote_app.routing.websocket_urlpatterns,
    ]

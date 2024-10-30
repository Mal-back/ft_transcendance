from django.urls import path, include
import pong_local_app.routing
import pong_remote_app.routing
import c4_local_app.routing
import c4_remote_app.routing

websocket_urlpatterns = [
    *pong_local_app.routing.websocket_urlpatterns,
    *pong_remote_app.routing.websocket_urlpatterns,
    *c4_local_app.routing.websocket_urlpatterns,
    *c4_remote_app.routing.websocket_urlpatterns,
    ]

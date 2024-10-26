from django.urls import path, include

websocket_urlpatterns = [
    path('', include('pong_remote_app.routing')),
    path('', include('pong_local_app.routing')),
    ]

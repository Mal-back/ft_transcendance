from django.urls import path
from .views import PongRemoteGameCreate

urlpatterns = [
    path('api/game/pong-remote/create/', PongRemoteGameCreate.as_view(), name='create-pong-remote-game'),
 ]

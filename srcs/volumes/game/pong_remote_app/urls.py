from django.urls import path
from .views import RemoteGameCreate

urlpatterns = [
    path('api/game/pong-remote/create/', RemoteGameCreate.as_view(), name='create-remote-game'),
 ]

from django.urls import path
from .views import C4RemoteGameCreate

urlpatterns = [
    path('api/game/c4-remote/create/', C4RemoteGameCreate.as_view(), name='create-c4-remote-game'),
 ]

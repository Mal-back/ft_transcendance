from django.urls import path
from .views import RemoteGameCreate

urlpatterns = [
    path('api/game/remote/', RemoteGameCreate.as_view(), name='create-remote-game'),
 ]

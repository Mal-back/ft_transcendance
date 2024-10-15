from django.urls import path
from . import views


urlpatterns = [
        path('', views.AvatarView.as_view(), name='avatar'),
]

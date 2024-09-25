from django.urls import path
from . import views


urlpatterns = [
        path('', views.MatchUserList.as_view(), name='user-create'),
        path('create/', views.MatchUserCreate.as_view(), name='user-create'),

]


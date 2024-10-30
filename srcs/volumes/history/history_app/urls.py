from django.urls import path
from . import views


urlpatterns = [
        path('user/create/', views.MatchUserCreate.as_view(), name='user-create'),
        path('user/update/<str:username>/', views.MatchUserUpdate.as_view(), name='user-update'),
        path('user/delete/<str:username>/', views.MatchUserDelete.as_view(), name='user-delete'),
        path('match/create/', views.MatchCreate.as_view(), name='user-delete'),
        path('match/', views.MatchList.as_view(), name='user-delete'),
]


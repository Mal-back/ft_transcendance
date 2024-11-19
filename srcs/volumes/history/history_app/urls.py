from django.urls import path
from . import views


urlpatterns = [
        path('', views.RetrieveAll.as_view(), name='retrieve-all'),
        path('user/create/', views.MatchUserCreate.as_view(), name='user-create'),
        path('user/update/<str:username>/', views.MatchUserUpdate.as_view(), name='user-update'),
        path('user/delete/<str:username>/', views.MatchUserDelete.as_view(), name='user-delete'),
        path('match/create/', views.MatchCreate.as_view(), name='match-create'),
        path('match/', views.MatchList.as_view(), name='match-list'),
        path('tournament/create/', views.TournamentCreate.as_view(), name='tournament-create'),
        path('tournament/', views.TournamentList.as_view(), name='tournament-list'),
        path('tournament/<int:pk>/', views.TournamentRetrieve.as_view(), name='tournament-retrieve'),
]


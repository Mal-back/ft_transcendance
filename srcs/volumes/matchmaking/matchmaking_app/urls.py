from django.urls import path
from . import views


urlpatterns = [
        path('create/', views.MatchUserCreate.as_view(), name='user-create'),
        path('<str:username>/update/', views.MatchUserUpdate.as_view(), name='user-delete'),
        path('<str:username>/delete/', views.MatchUserDelete.as_view(), name='user-update'),
        path('match/create/', views.MatchCreate.as_view(), name='match-create'),
        path('match/pending_invites/', views.MatchGetPendingInvites.as_view(), name='match-pending-invites'),
        path('match/sent_invite/', views.MatchGetSentInvite.as_view(), name='match-sent-invites'),
        path('match/<int:pk>/accept/', views.MatchAcceptInvite.as_view(), name='match-accept-invite'),
        path('match/<int:pk>/decline/', views.MatchDeclineInvite.as_view(), name='match-decline-invite'),
        path('match/<int:pk>/delete/', views.MatchDeleteInvite.as_view(), name='match-delete-invite'),
        path('match/get_accepted/', views.GetAcceptedMatch.as_view(), name='get-accepted-match'),
        path('match/<uuid:matchId>/finished/', views.HandleMatchResult.as_view(), name='handle-match-result'),
        path('matchmaking/join/', views.MatchMakingJoinQueue.as_view(), name='matchmaking-join-queue'),
        path('matchmaking/get_match/', views.MatchMakingRequestMatch.as_view(), name='matchmaking-join-queue'),
        path('matchmaking/leave/', views.MatchMakingLeaveQueue.as_view(), name='matchmaking-leave-queue'),
        path('matchmaking/<str:username>/win/', views.DebugIncrementVictory.as_view(), name='matchmaking-leave-queue'),
        path('matchmaking/<str:username>/lost/', views.DebugIncrementLoose.as_view(), name='matchmaking-leave-queue'),
        path('match/<int:pk>/debug_force_finished/', views.DebugSetGameAsFinished.as_view(), name='force-finished-game',),
]


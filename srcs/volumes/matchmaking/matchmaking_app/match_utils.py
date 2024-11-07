from rest_framework.response import Response
from rest_framework import status
from .models import Match, InQueueUser, TournamentUser

def check_user_restrictions(user):
    if InQueueUser.objects.filter(user=user.username).exists():
        return Response({'Error': 'You\'re in the matchmaking queue'}, status=status.HTTP_409_CONFLICT)
    if Match.objects.filter(player2=user.username, status__in=['accepted', 'in_progress']).exists():
        return Response({'Error': 'You already have a game in progress'}, status=status.HTTP_409_CONFLICT)
    if Match.objects.filter(player1=user.username, status__in=['pending', 'accepted', 'in_progress']).exists():
        return Response({'Error': 'You already sent an invite or have a game in progress'}, status=status.HTTP_409_CONFLICT)
    if TournamentUser.objects.filter(user=user).exists():
        return Response({'Error': 'You are in a tournament'}, status=status.HTTP_409_CONFLICT)
    return None

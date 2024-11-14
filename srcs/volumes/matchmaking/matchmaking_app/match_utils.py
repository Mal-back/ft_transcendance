from rest_framework.response import Response
from rest_framework import status
from .models import Match, InQueueUser, TournamentUser
from .trad import translate

def check_user_restrictions(user,request):
    lang = request.headers.get('lang') if request and request.headers else "en"
    if InQueueUser.objects.filter(user=user.username).exists():
        message = translate(lang, "in_matchmaking_queue_error")
        return Response({'Error': message}, status=status.HTTP_409_CONFLICT)
    if Match.objects.filter(player2=user.username, status__in=['accepted', 'in_progress']).exists():
        message = translate(lang, "have_game_in_progress_error")
        return Response({'Error': message}, status=status.HTTP_409_CONFLICT)
    if Match.objects.filter(player1=user.username, status__in=['pending', 'accepted', 'in_progress']).exists():
        message = translate(lang, "have_invite_or_game_error")
        return Response({'Error': message}, status=status.HTTP_409_CONFLICT)
    if TournamentUser.objects.filter(user=user).exists():
        message = translate(lang, "in_tournament_error")
        return Response({'Error': message}, status=status.HTTP_409_CONFLICT)
    return None

import threading
from time import sleep
from requests import delete
from rest_framework import status
from rest_framework.views import Response

from serializers import TournamentDetailSerializer, TournamentToHistorySerializer
from .models import Tournament, Match, MatchUser, TournamentUser
from ms_client.ms_client import MicroServiceClient, RequestsFailed, InvalidCredentialsException
from django.db.models import F

def schedule_rounds(tournament:Tournament):
    players_list = tournament.confirmed_players.values_list('user__username', flat=True)
    schedule = round_robin_scheduler(list(players_list))
    print(schedule)
    tournament.round_schedule = schedule
    tournament.save()
    create_round_matches(tournament)

def create_round_matches(tournament:Tournament):
    round_no = tournament.current_round
    round_matches = tournament.round_schedule[round_no - 1]
    for match in round_matches:
        try :
            sender = MicroServiceClient()
            ret = sender.send_requests(
                    urls = [f'http://game:8443/api/game/{tournament.game_type}-remote/create/'],
                    expected_status=[201],
                    method='post',
                    body={
                        'player_1_name':f'{match[0]}',
                        'player_2_name':f'{match[1]}',
                        }
                    )
            response = ret[f'http://game:8443/api/game/{tournament.game_type}-remote/create/'] 
            print(response.status_code)
            print(response.text)
            matchId = response.text.strip('"')
        except (RequestsFailed, InvalidCredentialsException):
            raise TournamentInternalError('Could not create match')
        try:
            player1 = MatchUser.objects.get(username=match[0])
            player2 = MatchUser.objects.get(username=match[1])
        except MatchUser.DoesNotExists:
            raise TournamentInternalError('Could not retrieve user')
        Match.objects.create(player1=player1, player2=player2,
                             game_type=tournament.game_type,
                             matchId=matchId,
                             status='in_progress',
                             tournament=tournament,
                             )

def delete_tournament(id):
    sleep(30)
    try:
        Tournament.objects.get(id=id).delete()
    except Tournament.DoesNotExists:
        pass

def handle_finished_matches(match:Match, data:dict):
    TournamentUser.objects.filter(username=data['winner']).update(match_won=F('match_won') + 1) 
    TournamentUser.objects.filter(username=data['looser']).update(match_won=F('match_lost') + 1) 
    tournament = match.tournament
    match.delete()

    if not match.objects.filter(tournament=tournament).exists() :
        if tournament.round + 1 == tournament.confirmed_players.count():
            tournament.status = 'finished'
            serializer = TournamentToHistorySerializer(tournament)
            try:
                sender = MicroServiceClient()
                sender.send_requests(
                    urls = [f'http://game:8443/api/history/tournament/create/'],
                    expected_status=[201],
                    method='post',
                    body=serializer.data
                    )
            except (RequestsFailed, InvalidCredentialsException):
                pass
            def delete_tournament():
                try:
                    Tournament.objects.get(id=id).delete()
                except Tournament.DoesNotExists:
                    pass
            timer = threading.Timer(10, delete_tournament)
        tournament.save()
        

def round_robin_scheduler(players):
    print(type(players))
    print(len(players))
    print(players)
    if len(players) % 2 != 0:
        players.append('Bye')
    num_players = len(players)
    schedule = []

    for round in range(num_players - 1):
        round_matches = []
        for i in range(num_players // 2):
            player1 = players[i]
            player2 = players[num_players - i - 1]
            if player1 != 'Bye' and player2 != 'Bye': 
                round_matches.append([player1, player2])

        schedule.append(round_matches)

        players = [players[0]] + [players[-1]] + players[1:-1] 
    return schedule

class TournamentInternalError(Exception):
    def __init__(self, message, code=None):
        super().__init__(message)

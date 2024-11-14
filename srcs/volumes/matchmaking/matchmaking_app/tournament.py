import threading
from django.db import connection
from .serializers import TournamentToHistorySerializer
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

def debug_export_result(tournament):
            order = tournament.confirmed_players.order_by('-matches_won')
            thread = threading.Thread(target=update_users_stats, args=(order, tournament.game_type))
            thread.daemon = True
            thread.start()

def handle_finished_matches(match:Match, data:dict):
    TournamentUser.objects.filter(user=data['winner']).update(matches_won=F('matches_won') + 1) 
    TournamentUser.objects.filter(user=data['looser']).update(matches_lost=F('matches_lost') + 1) 
    tournament = match.tournament
    match.delete()

    if not Match.objects.filter(tournament=tournament).exists() :
        players = tournament.confirmed_players.count()
        is_finished = False
        if players % 2 == 0 and tournament.current_round + 1 == players:
            is_finished = True
        elif players % 2 == 1 and tournament.current_round == players:
            is_finished = True
        if is_finished == True:
            tournament.status = 'finished'
            serializer = TournamentToHistorySerializer(tournament)
            try:
                sender = MicroServiceClient()
                responses = sender.send_requests(
                    urls = [f'http://history:8443/api/history/tournament/create/'],
                    expected_status=[201],
                    method='post',
                    body=serializer.data
                    )
            except (RequestsFailed, InvalidCredentialsException):
                pass
            ret = responses['http://history:8443/api/history/tournament/create/']
            tournament.historyId = ret.json()['id']
            order = tournament.confirmed_players.order_by('-matches_won')
            thread = threading.Thread(target=update_users_stats, args=(order, tournament.game_type))
            thread.daemon = True
            thread.start()
            pk = tournament.id
            def delete_tournament():
                try:
                    Tournament.objects.get(id=pk).delete()
                    connection.close()
                except Tournament.DoesNotExists:
                    pass
            timer = threading.Timer(10, delete_tournament)
            timer.start()
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

def update_users_stats(players_list, game_type):
    winner_points = players_list[0].matches_won
    urls = []
    for player in players_list:
        if player.matches_won == winner_points:
            urls.append(f'http://users:8443/api/users/{player.user.username}/increment/tournaments_{game_type}_won/')
        else:
            urls.append(f'http://users:8443/api/users/{player.user.username}/increment/tournaments_{game_type}_lost/')
    sender = MicroServiceClient()
    try :
        sender.send_requests(urls=urls,
                             method='patch',
                             expected_status=[200]) 
    except (RequestsFailed, InvalidCredentialsException):
        pass
    connection.close()

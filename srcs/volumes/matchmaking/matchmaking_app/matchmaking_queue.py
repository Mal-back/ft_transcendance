from datetime import timedelta
from django.utils.timezone import now, timedelta
from .models import InQueueUser, Match, MatchUser
from ms_client.ms_client import MicroServiceClient, RequestsFailed, InvalidCredentialsException

def check_range_update(user:InQueueUser):
    if now() - user.last_range_update > timedelta(seconds=3): 
        user.range_to_search += 0.1
        user.last_range_update = now()
        user.save()

def get_opponent(user:InQueueUser):
    check_range_update(user)
    cutoff = now() - timedelta(seconds=10)
    InQueueUser.objects.filter(last_range_update__lt=cutoff).delete()
    if user.game_type == 'pong':
        potential_opps = InQueueUser.objects.filter(win_rate__range=(user.minimal_wr, user.maximal_wr),
                                                    game_type=user.game_type).exclude(user=user.user).order_by('?')
    for potential_opp in potential_opps:
        check_range_update(potential_opp)
        reverse_opps = InQueueUser.objects.filter(win_rate__range=(potential_opp.minimal_wr, potential_opp.maximal_wr))
        if user in reverse_opps:
            try:
                sender = MicroServiceClient()
                ret = sender.send_requests(
                        urls = [f'http://game:8443/api/game/{user.game_type}-remote/create/'],
                        expected_status=[201],
                        method='post',
                        body={
                            'player_1_name':f'{user.user.username}',
                            'player_2_name':f'{potential_opp.user.username}',
                            }
                        )
                response = ret[f'http://game:8443/api/game/{user.game_type}-remote/create/'] 
                matchId = response.text.strip('"')
            except (RequestsFailed, InvalidCredentialsException):
                raise YouHaveNoOpps('You\'re an OG with no opps')
            match = Match.objects.create(player1=user.user,
                                 player2=potential_opp.user,
                                 game_type=user.game_type,
                                 matchId=matchId,
                                 status='in_progress')
            user.delete()
            potential_opp.delete()
            return match
    raise YouHaveNoOpps('You\'re an OG with no opps')

class YouHaveNoOpps(Exception):
    def __init__(self, message, code=None):
        super().__init__(message)

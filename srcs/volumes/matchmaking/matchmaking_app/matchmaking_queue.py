from datetime import timedelta
from django.utils.timezone import now
from .models import InQueueUser, Match, MatchUser
from ms_client.ms_client import MicroServiceClient, RequestsFailed, InvalidCredentialsException

def check_range_update(user:InQueueUser):
    if now() - user.last_range_update > timedelta(seconds=10): 
        user.range_to_search += 0.05
        user.last_range_update = now()
        user.save()

def get_opponent(user:InQueueUser):
    check_range_update(user)
    potential_opps = InQueueUser.objects.filter(win_rate__range=(user.minimal_wr, user.maximal_wr)).exclude(user=user.user).order_by('?')
    for potential_opp in potential_opps:
        check_range_update(potential_opp)
        reverse_opps = InQueueUser.objects.filter(win_rate__range=(potential_opp.minimal_wr, potential_opp.maximal_wr))
        if user in reverse_opps:
            try:
                sender = MicroServiceClient()
                ret = sender.send_requests(
                        urls = ['http://game:8443/api/game/pong-remote/create/'],
                        expected_status=[201],
                        method='post',
                        body={
                            'player_1_name':f'{user.user}',
                            'player_2_name':f'{potential_opp.user}',
                            }
                        )
                response = ret['http://game:8443/api/game/pong-remote/create/'] 
                matchId = response.text.strip('"')
                Match.objects.create
            except (RequestsFailed, InvalidCredentialsException):
                pass
            try:
                player1 = MatchUser.objects.get(username=user.user)
                player2 = MatchUser.objects.get(username=potential_opp.user)
            except MatchUser.DoesNotExit:
                pass
    raise YouHaveNoOpps('You\'re an OG with no opps')

class YouHaveNoOpps(Exception):
    def __init__(self, message, code=None):
        super().__init__(message)

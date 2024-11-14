from django.db.models import F
from ms_client.ms_client import MicroServiceClient, RequestsFailed, InvalidCredentialsException
from .models import MatchUser

def end_single_match(match, data):
    if data['game_type'] == 'pong':
        MatchUser.objects.filter(username=data['winner']).update(pong_match_won=F('pong_match_won') + 1) 
        MatchUser.objects.filter(username=data['looser']).update(pong_match_won=F('pong_match_lost') + 1) 
    else:
        MatchUser.objects.filter(username=data['winner']).update(c4_match_won=F('c4_match_won') + 1) 
        MatchUser.objects.filter(username=data['looser']).update(c4_match_won=F('c4_match_lost') + 1) 
    sender = MicroServiceClient()
    try :
        sender.send_requests(urls=[f"http://users:8443/api/users/{data['winner']}/increment/single_games_{data["game_type"]}_won/",
                                    f"http://users:8443/api/users/{data['looser']}/increment/single_games_{data["game_type"]}_lost/",],
                             method='patch',
                             expected_status=[200]) 
    except (RequestsFailed, InvalidCredentialsException):
        pass
    try :
        sender.send_requests(urls=["http://history:8443/api/history/match/create/"],
                             method='post',
                             expected_status=[201],
                             body=data) 
    except (RequestsFailed, InvalidCredentialsException):
        pass
    match.status = 'finished'
    match.delete()

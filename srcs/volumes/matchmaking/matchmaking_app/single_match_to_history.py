from django.db.models import F
from ms_client.ms_client import MicroServiceClient, RequestsFailed, InvalidCredentialsException
from .models import MatchUser

def end_single_match(match, data):
        MatchUser.objects.filter(username=data['winner']).update(match_won=F('match_won') + 1) 
        MatchUser.objects.filter(username=data['looser']).update(match_won=F('match_lost') + 1) 
        sender = MicroServiceClient()
        try :
            sender.send_requests(urls=[f"http://users:8443/api/users/{data['winner']}/increment/single_games_won",
                                        "http://users:8443/api/users/{data['looser']}/increment/single_games_lost",],
                                 method='patch',
                                 expected_status=[200]) 
        except (RequestsFailed, InvalidCredentialsException):
            pass
        try :
            data.update({'played_at':match.created_at})
            sender.send_requests(urls=["http://matchmaking:8443/api/history/match/create/"],
                                 method='post',
                                 expected_status=[201],
                                 body=data) 
            pass
        except (RequestsFailed, InvalidCredentialsException):
            pass
        match.status = 'finished'
        match.delete()

from ms_client.ms_client import MicroServiceClient, RequestsFailed, InvalidCredentialsException

def end_single_match(match, data):
        sender = MicroServiceClient()
        try :
            sender.send_requests(urls=[f"http://users:8443/api/users/{data['winner']}/increment/single_games_won",
                                        "http://users:8443/api/users/{data['looser']}/increment/single_games_lost",],
                                 method='patch',
                                 expected_status=[200]) 
        except (RequestsFailed, InvalidCredentialsException):
            pass
        try :
            # sender.send_requests(urls=["http://users:8443/api/history/"],
            #                      method='post',
            #                      expected_status=[201],
            #                      body=data) 
            pass
        except (RequestsFailed, InvalidCredentialsException):
            pass
        match.status = 'finished'
        match.delete()

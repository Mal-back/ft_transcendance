from .models import Tournament

def schedule_rounds(tournament:Tournament):
    players_list = tournament.confirmed_players.values_list('user__username', flat=True)
    tournament.round_schedule = players_list
    tournament.save()
    create_round_matches(tournament)

def create_round_matches(tournament:Tournament):
    round_no = tournament.current_round
    round_matches = tournament.round_schedule[round_no - 1]
    for match in round_matches:
        print(match)




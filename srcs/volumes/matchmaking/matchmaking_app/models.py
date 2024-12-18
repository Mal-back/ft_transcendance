from django.db import models
from django.utils import choices
from django.utils.timezone import now

# Create your models here.

class MatchUser(models.Model):
    username = models.CharField(max_length=128, unique=True)
    last_online_update = models.DateTimeField(null=True)
    pong_match_won = models.IntegerField(default=0)
    pong_match_lost = models.IntegerField(default=0)
    c4_match_won = models.IntegerField(default=0)
    c4_match_lost = models.IntegerField(default=0)

    @property
    def is_authenticated(self):
        return True

    @property
    def pong_win_rate(self):
        total_matches = self.pong_match_lost + self.pong_match_won
        return self.pong_match_won / total_matches if total_matches != 0 else 0

    @property
    def c4_win_rate(self):
        total_matches = self.c4_match_lost + self.c4_match_won
        return self.c4_match_won / total_matches if total_matches != 0 else 0
        
class InQueueUser(models.Model):
    user = models.ForeignKey('MatchUser',
                            related_name='user_in_queue',
                            on_delete=models.PROTECT,
                            to_field='username')
    win_rate = models.FloatField()
    range_to_search = models.FloatField(default=0.05)
    last_range_update = models.DateTimeField(default=now)
    game_type = models.TextField(choices=[('pong', 'Pong'),
                                           ('c4', 'Connect four')])

    @property
    def minimal_wr(self):
        mini =  self.win_rate - self.range_to_search
        return mini if mini > 0 else 0

    @property
    def maximal_wr(self):
        maxi =  self.win_rate + self.range_to_search
        return maxi if maxi < 1 else 1

class TournamentUser(models.Model):
    user = models.ForeignKey('MatchUser',
                            related_name='tournament_user',
                            on_delete=models.PROTECT,
                            to_field='username')
    tournament = models.ForeignKey('Tournament',
                                related_name='confirmed_players',
                                on_delete=models.CASCADE,)
    matches_won = models.IntegerField(default=0)
    matches_lost = models.IntegerField(default=0)
    
class Tournament(models.Model):
    owner = models.ForeignKey('MatchUser',
                                related_name='tournament_owner',
                                on_delete=models.PROTECT,
                                to_field='username')
    invited_players = models.ManyToManyField('MatchUser', related_name='invited_players')
    current_round = models.IntegerField(default=1)
    game_type = models.TextField(choices=[('pong', 'Pong'),
                                           ('c4', 'Connect four')])

    round_schedule = models.JSONField(null=True)
    status = models.TextField(max_length=20, default='pending', choices=[('pending', 'Pending'),
                                                                         ('in_progress', 'In progress'),
                                                                         ('finished', 'Finished')
                                                                        ])
    historyId = models.IntegerField(null=True)

class Match(models.Model):
    player1 = models.ForeignKey('MatchUser',
                                related_name='matches_as_p1',
                                on_delete=models.PROTECT,
                                to_field='username')
    player2 = models.ForeignKey('MatchUser',
                                related_name='matches_as_p2',
                                on_delete=models.PROTECT,
                                to_field='username')
    player1_points = models.IntegerField(default=0)
    player2_points = models.IntegerField(default=0)
    game_type = models.TextField(choices=[('pong', 'Pong'),
                                           ('c4', 'Connect four')])
    matchId = models.UUIDField(null=True)
    status = models.TextField(max_length=20, default='pending', choices=[('pending', 'Pending'),
                                                                         ('accepted', 'Accepted'),
                                                                         ('declined', 'Declined'),
                                                                         ('cancelled', 'Cancelled'),
                                                                         ('in_progess', 'In progress'),
                                                                         ('finished', 'Finished')])
    created_at = models.DateTimeField(auto_now_add=True)
    tournament = models.ForeignKey('Tournament',
                                   related_name='tournament',
                                   on_delete=models.CASCADE,
                                   null=True,
                                   blank=True)

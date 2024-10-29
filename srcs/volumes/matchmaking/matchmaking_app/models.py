from django.db import models
from django.utils import choices

# Create your models here.

class MatchUser(models.Model):
    username = models.CharField(max_length=128, unique=True)
    last_online_update = models.DateTimeField(null=True)

    @property
    def is_authenticated(self):
        return True
    
class Tournament(models.Model):
    name = models.CharField(max_length=255)
    invited_players = models.ManyToManyField('MatchUser', related_name='invited_players', blank=True)
    confirmed_players = models.ManyToManyField('MatchUser', related_name='confirmed_players', blank=True)
    current_round = models.IntegerField(default=1)
    is_finished = models.BooleanField(default=False)
    winner = models.ForeignKey('MatchUser',
                                related_name='winner',
                                on_delete=models.PROTECT)

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
                                           ('connect_four', 'Connect four')])
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

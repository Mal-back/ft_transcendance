from django.db import models

# Create your models here.

class MatchUser(models.Model):
    username = models.CharField(max_length=128, unique=True)

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
    winner = models.ForeignKey('MatchUser',
                                related_name='matches_as_p1',
                                on_delete=models.PROTECT,
                                to_field='username')
    looser = models.ForeignKey('MatchUser',
                                related_name='matches_as_p2',
                                on_delete=models.PROTECT,
                                to_field='username')
    winner_points = models.IntegerField(default=0)
    looser_points = models.IntegerField(default=0)
    game_type = models.TextField(choices=[('pong', 'Pong'),
                                           ('connect_four', 'Connect four')])
    played_at = models.DateTimeField(auto_now_add=True)

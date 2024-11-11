from django.db import models

# Create your models here.

class MatchUser(models.Model):
    username = models.CharField(max_length=128, unique=True)

class TournamentUser(models.Model):
    username = models.ForeignKey('MatchUser',
                                 related_name='final_ranking',
                                 on_delete=models.PROTECT,
                                 to_field='username')
    matches_won = models.IntegerField()
    matches_lost = models.IntegerField()
    games_played = models.IntegerField()
    user_profile = models.URLField()
    tournament = models.ForeignKey('Tournament',
                                   related_name='tournament',
                                   on_delete=models.CASCADE)

class Tournament(models.Model):
    game_type = models.TextField(choices=[('pong', 'Pong'),
                                           ('c4', 'Connect four')])

class Match(models.Model):
    winner = models.ForeignKey('MatchUser',
                                related_name='winner',
                                on_delete=models.PROTECT,
                                to_field='username')
    looser = models.ForeignKey('MatchUser',
                                related_name='looser',
                                on_delete=models.PROTECT,
                                to_field='username')
    winner_points = models.IntegerField(default=0)
    looser_points = models.IntegerField(default=0)
    game_type = models.TextField(choices=[('pong', 'Pong'),
                                           ('c4', 'Connect four')])
    played_at = models.DateTimeField(auto_now_add=True)

from django.db import models

# Create your models here.

class PublicUser(models.Model):
    username = models.CharField(max_length=128, unique=True)
    profilePic = models.URLField()
    is_online = models.BooleanField(default=True)
    account_creation = models.DateTimeField(auto_now_add=True)
    last_seen_online = models.DateTimeField(auto_now=True)
    friends = models.ManyToManyField('self', symmetrical=False, blank=True)
    single_games_won = models.IntegerField(default=0)
    single_games_lost = models.IntegerField(default=0)
    tournament_games_won = models.IntegerField(default=0)
    tournament_games_lost = models.IntegerField(default=0)
    tournaments_won = models.IntegerField(default=0)
    tournaments_lost = models.IntegerField(default=0)

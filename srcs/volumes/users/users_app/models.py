from django.db import models

# Create your models here.

class PublicUser(models.Model):
    username = models.CharField(max_length=128, unique=True)
    profilePic = models.URLField()
    is_online = models.BooleanField()
    account_creation = models.DateTimeField(auto_now_add=True)
    last_seen_online = models.DateTimeField(auto_now_add=True)
    friends = models.ManyToManyField('self', symmetrical=False, blank=True)
    single_game_won = models.IntegerField(default=0)
    single_game_lost = models.IntegerField(default=0)
    tournament_game_won = models.IntegerField(default=0)
    tournament_game_lost = models.IntegerField(default=0)
    tounament_won = models.IntegerField(default=0)
    tournament_lost = models.IntegerField(default=0)

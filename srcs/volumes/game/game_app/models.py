from django.db import models

class LocalGame(models.Model):
    game_creator = models.CharField(max_length=100)
    game_id = models.CharField(max_length=100)
    
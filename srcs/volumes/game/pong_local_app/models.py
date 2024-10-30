from django.db import models

class PongLocalGame(models.Model):
    game_id = models.CharField(max_length=100, unique=True)
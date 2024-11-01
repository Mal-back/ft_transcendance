from django.db import models

class C4LocalGame(models.Model):
    game_id = models.CharField(max_length= 100, unique=True)
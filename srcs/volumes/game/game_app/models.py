from django.db import models
from django.urls import reverse
import uuid
from .game_srcs.Pong import Pong
# Create your models here.

class Game(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, help_text='Unique ID for this game', unique=True)
    player1_username = models.CharField(max_length=128)
    player2_username = models.CharField(max_length=128)
    player1_score = models.IntegerField(default=0)
    player2_score = models.IntegerField(default=0)
    
    
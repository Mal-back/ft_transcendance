from django.db import models
import uuid
import logging

log = logging.getLogger(__name__)
    
class RemoteGame(models.Model):
    game_id = models.CharField(max_length=100, unique=True, default=str(uuid.uuid4()))
    player_1_name = models.CharField(max_length=100)
    player_2_name = models.CharField(max_length=100)
    player_1_connected = models.BooleanField(default=False)
    player_2_connected = models.BooleanField(default=False)
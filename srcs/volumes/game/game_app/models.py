from django.db import models
import uuid
import logging

log = logging.getLogger(__name__)

class LocalGame(models.Model):
    game_creator = models.CharField(max_length=100)
    game_id = models.CharField(max_length=100, unique=True)
    
class RemoteGame(models.Model):
    game_id = models.CharField(max_length=100, unique=True)
    player_1_name = models.CharField(max_length=100)
    player_2_name = models.CharField(max_length=100)
    player_1_connected = models.BooleanField(default=False)
    player_2_connected = models.BooleanField(default=False)
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.game_id = str(uuid.uuid4())
        log.info("Created model RemoteGame with id " + self.game_id)
        
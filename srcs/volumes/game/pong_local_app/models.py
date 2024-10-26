from django.db import models
import logging

log = logging.getLogger(__name__)

class LocalGame(models.Model):
    game_creator = models.CharField(max_length=100)
    game_id = models.CharField(max_length=100, unique=True)
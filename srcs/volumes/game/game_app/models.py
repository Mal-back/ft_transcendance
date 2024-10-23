from django.db import models
import uuid

class LocalGame(models.Model):
    game_creator = models.CharField(max_length=100)
    game_id = models.CharField(max_length=100, unique=True)
    
class Tournament(models.Model):
    name = models.CharField(max_length=255)
    
class Player(models.Model):
    name = models.CharField(max_length=30)
    
    
    
from django.db import models

# Create your models here.

class MatchUser(models.Model):
    username = models.CharField(max_length=128, unique=True)

class Match(models.Model):
    player1 = models.One

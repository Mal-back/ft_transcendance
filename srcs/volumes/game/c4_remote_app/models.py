from django.db import models
import uuid

class C4RemoteGame(models.Model):
	game_id = models.UUIDField(primary_key=True, unique=True, default=uuid.uuid4)
	player_1_name = models.CharField(max_length=100)
	player_2_name = models.CharField(max_length=100)
	player_1_connected = models.BooleanField(default=False)
	player_2_connected = models.BooleanField(default=False)

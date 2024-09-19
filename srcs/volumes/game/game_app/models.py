from django.db import models
from django.urls import reverse
import uuid
# Create your models here.

class Game(models.Model):
    # uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, help_text='Unique ID for this game')
    # uuid = models.CharField(max_length=128, unique=True)
    name = models.CharField(max_length=128, unique=True)

	
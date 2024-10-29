from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.timezone import now

# Create your models here.

class CustomUser(AbstractUser):
   two_fa_enabled = models.BooleanField(default=False) 
   last_log = models.DateTimeField(default=now)

class Service(models.Model):
    serviceName = models.CharField(max_length=255)
    password = models.CharField(max_length=255)

class Token(models.Model):
    serviceName = models.CharField(max_length=255)
    token = models.TextField()

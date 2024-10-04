from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class CustomUser(AbstractUser):
   two_fa_enabled = models.BooleanField(default=False) 

class Service(models.Model):
    serviceName = models.CharField(max_length=255)
    password = models.CharField(max_length=255)

class Token(models.Model):
    serviceName = models.CharField(max_length=255)
    token = models.TextField()

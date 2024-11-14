from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.timezone import now
import pyotp

# Create your models here.

class CustomUser(AbstractUser):
   two_fa_enabled = models.BooleanField(default=False)
#    otp_secret = models.CharField(max_length=32, blank=True, null=True)
   last_log = models.DateTimeField(default=now)

   def generate_otp_secret(self):
        self.otp_secret = pyotp.random_base32()
        self.save()

   def get_totp(self):
        totp = pyotp.TOTP(self.otp_secret)
        return totp.now()

class Service(models.Model):
    serviceName = models.CharField(max_length=255)
    password = models.CharField(max_length=255)

class Token(models.Model):
    serviceName = models.CharField(max_length=255)
    token = models.TextField()

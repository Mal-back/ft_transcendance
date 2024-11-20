from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from auth_app.models import Service, Token
from auth_app.serializers import createServiceToken
import os

class Command(BaseCommand):
    help = 'Create microservice users'
    
    def handle(self, *args, **kwargs):
        microservices = [
                {'serviceName' : 'auth', 'password': os.getenv('AUTH_PASSWORD')},
                {'serviceName' : 'users', 'password': os.getenv('USERS_PASSWORD')},
                {'serviceName' : 'matchmaking', 'password': os.getenv('MATCHMAKING_PASSWORD')},
                {'serviceName' : 'avatar_manager', 'password': os.getenv('AVATAR_PASSWORD')},
                {'serviceName' : 'history', 'password': os.getenv('HISTORY_PASSWORD')},
                {'serviceName' : os.getenv('DJANGO_GAME_AUTH_NAME'), 'password': os.getenv('DJANGO_GAME_AUTH_PASSWORD')}
                ]
        for microservice in microservices:
            serviceName = microservice['serviceName']
            password = microservice['password']
            
            Service.objects.get_or_create(serviceName=serviceName, defaults={'password': make_password(password)})

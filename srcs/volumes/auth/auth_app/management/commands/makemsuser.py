from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from auth_app.models import Service

class Command(BaseCommand):
    help = 'Create microservice users'
    
    def handle(self, *args, **kwargs):
        microservices = [
                {'serviceName' : 'auth', 'password': 'acab1312'},
                {'serviceName' : 'users', 'password': 'acab1313'},
                ]
        for microservice in microservices:
            serviceName = microservice['serviceName']
            password = microservice['password']
            
            user, created = Service.objects.get_or_create(serviceName=serviceName, defaults={'password': make_password(password)})

            if created:
                self.stdout.write(self.style.SUCCESS(f'User "{serviceName}" created'))
            else:
                self.stdout.write(self.style.WARNING(f'User "{serviceName}" already exists'))

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User, Group
from django.contrib.auth.hashers import make_password

class Command(BaseCommand):
    help = 'Create microservice users'
    
    def handle(self, *args, **kwargs):
        groups = ['service']
        for group_name in groups:
                    group, created = Group.objects.get_or_create(name=group_name)
        if created:
            self.stdout.write(self.style.SUCCESS(f'Group "{group_name}" created'))
        else:
            self.stdout.write(self.style.WARNING(f'Group "{group_name}" already exists'))

        microservices = [
                {'username' : 'serv1', 'password': 'acab1312', 'group': 'service'}
                ]
        for microservice in microservices:
            username = microservice['username']
            password = microservice['password']
            group_name = microservice['group']
            
            user, created = User.objects.get_or_create(username=username, defaults={'password': make_password(password)})

            if created:
                self.stdout.write(self.style.SUCCESS(f'User "{username}" created'))
            else:
                self.stdout.write(self.style.WARNING(f'User "{username}" already exists'))

            group = Group.objects.get(name=group_name)
            if user and group:
                user.groups.add(group)
                self.stdout.write(self.style.SUCCESS(f'User "{username}" added to group "{group_name}"'))
            else:
                self.stdout.write(self.style.ERROR(f'Could not find group "{group_name}" for user "{username}"'))



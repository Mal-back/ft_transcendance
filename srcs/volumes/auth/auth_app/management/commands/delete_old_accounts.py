from datetime import timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from django.utils.timezone import now
from auth_app.models import CustomUser
from auth_app.serializers import createServiceToken
from auth_app.requests_manager import send_delete_requests
from dateutil.relativedelta import relativedelta
import os

class Command(BaseCommand):
    help = 'Delete accounts inactive for three years'
    
    def handle(self, *args, **kwargs):
        cutoff = now() - relativedelta(years=3)
        old_users = CustomUser.objects.filter(last_log__lt=cutoff)
        print('Checking for old accounts')

        for user in old_users:
            print(f'Deleting {user.username} account')
            req_url = [f'http://matchmaking:8443/api/matchmaking/{user.username}/delete/',
                       f'http://users:8443/api/users/delete/{user.username}/',
                       f'http://history:8443/api/history/user/delete/{user.username}/',
                       'http://avatars:8443/api/avatars/',
                       ]
            send_delete_requests(urls=req_url, body={'username': user.username})
            user.delete()

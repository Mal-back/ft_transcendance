from django.core.management.base import BaseCommand
from history_app.models import MatchUser

class Command(BaseCommand):
    help = 'Create Deleted Account User'
    
    def handle(self, *args, **kwargs):
            username = 'deleted_account'
            
            user, created = MatchUser.objects.get_or_create(username=username)

            if created:
                self.stdout.write(self.style.SUCCESS(f'User "{username}" created'))
            else:
                self.stdout.write(self.style.WARNING(f'User "{username}" already exists'))

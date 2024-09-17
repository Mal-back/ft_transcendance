from django.contrib import admin

from users_app.models import PublicUser
admin.site.register(PublicUser)
class PublicUserInLine(admin.TabularInline):
    model = PublicUser

# @admin.register(PublicUser)
# class PublicUserAdmin(admin.ModelAdmin):
#     list_display = ('username', 'profilPic', 'account_creation', 'last_seen_online',
#                     'friends', 'single_games_won', 'single_games_lost',
#                     'single_games_lost', 'tournament_games_won', 'tournament_games_lost',
#                     'tournaments_won', 'tournaments_lost')
#     fields = ['username', 'profilPic', 'account_creation', 'last_seen_online',
#                     'friends', 'single_games_won', 'single_games_lost',
#                     'single_games_lost', 'tournament_games_won', 'tournament_games_lost',
#                     'tournaments_won', 'tournaments_lost']
#     inlines = [PublicUserInLine]
    
# admin.site.register(PublicUser, PublicUserAdmin)
# Register your models here.

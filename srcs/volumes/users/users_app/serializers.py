from datetime import timedelta
from rest_framework import serializers
from .models import PublicUser
from django.utils.timezone import now

class PublicUserDetailSerializer(serializers.ModelSerializer):
    total_games = serializers.SerializerMethodField()
    total_tournaments = serializers.SerializerMethodField()
    total_single_games = serializers.SerializerMethodField()
    overall_wins = serializers.SerializerMethodField()
    overall_losts = serializers.SerializerMethodField()
    tournament_win_rate = serializers.SerializerMethodField()
    single_games_win_rate = serializers.SerializerMethodField()
    tournament_games_win_rate = serializers.SerializerMethodField()
    overall_win_rate = serializers.SerializerMethodField()
    is_online = serializers.SerializerMethodField()
    is_your_friend = serializers.SerializerMethodField()
    friend_management = serializers.SerializerMethodField()
    class Meta:
        model = PublicUser
        fields =  ['username','profilePic', 'account_creation', 'is_online',
                   'single_games_won', 'single_games_lost', 'tournament_games_won',
                   'tournament_games_lost', 'tournaments_won', 'tournaments_lost',
                   'total_games', 'total_tournaments', 'is_your_friend', 'friend_management',
                  'total_single_games', 'overall_wins', 'overall_losts',
                  'tournament_win_rate', 'single_games_win_rate',
                  'tournament_games_win_rate', 'overall_win_rate',
                  ]
        
    def get_total_tournaments(self, obj):
        return obj.tournaments_won + obj.tournaments_lost

    def get_total_single_games(self, obj):
        return obj.single_games_won + obj.single_games_lost

    def get_total_games(self, obj):
        return self.get_total_single_games(obj) + obj.tournament_games_won + obj.tournament_games_lost

    def get_overall_wins(self, obj):
        return obj.single_games_won + obj.tournament_games_won

    def get_overall_losts(self, obj):
        return obj.single_games_lost + obj.tournament_games_lost

    def get_tournament_win_rate(self, obj):
        if obj.tournaments_lost == 0:
            return 0
        return obj.tournaments_won / obj.tournaments_lost if obj.tournaments_lost != 0 else 100

    def get_tournament_games_win_rate(self, obj):
        if obj.tournament_games_won == 0:
            return 0
        total_games = obj.tournament_games_lost + obj.tournament_games_won
        return obj.tournament_games_won / (total_games) if total_games != 0 else 0

    def get_single_games_win_rate(self, obj):
        if obj.single_games_won == 0:
            return 0
        total_games = obj.single_games_won + obj.single_games_lost
        return obj.single_games_won / obj.single_games_lost if obj.single_games_lost != 0 else 100

    def get_overall_win_rate(self, obj):
        if self.get_overall_wins(obj) == 0:
            return 0
        return self.get_overall_wins(obj) / self.get_overall_losts(obj) if self.get_overall_losts(obj) != 0 else 100

    def get_is_online(self, obj):
        if obj.last_seen_online == None or now() - obj.last_seen_online > timedelta(minutes=15):
            return False 
        return True

    def get_is_your_friend(self, obj):
        request = self.context.get('request')
        if request.user is not None:
            if obj.id == request.user.id:
                return None
            try:
                user = PublicUser.objects.get(pk=request.user.id)
            except PublicUser.DoesNotExist:
                return None
            if user.friends.filter(id=obj.pk).exists():
                return True
            return False
        else :
            return None

    def get_friend_management(self, obj):
        request = self.context.get('request')
        if request.user is not None and request.user.id != obj.id:
            try:
                logged_user = PublicUser.objects.get(pk=request.user.id)
            except PublicUser.DoesNotExist:
                return None

            if logged_user.friends.filter(id=obj.pk).exists():
                return {
                    'action': 'remove',
                    'url': f'/api/users/{logged_user.username}/friends/delete/{obj.username}/'
                }
            else:
                return {
                    'action': 'add',
                    'url': f'/api/users/{logged_user.username}/friends/add/{obj.username}/'
                }
        return None


class PublicUserListSerializer(serializers.ModelSerializer):
    is_your_friend = serializers.SerializerMethodField()
    is_online = serializers.SerializerMethodField()
    full_profile = serializers.HyperlinkedIdentityField(
            view_name='user-detail',
            lookup_field='username'
            )
    friend_management = serializers.SerializerMethodField()
    class Meta:
        model = PublicUser
        fields = ['username', 'profilePic', 'is_online', 'full_profile', 'is_your_friend', 'friend_management']

    def get_is_online(self, obj): 
        if obj.last_seen_online == None or now() - obj.last_seen_online > timedelta(minutes=5):
            return False 
        return True
    
    def get_is_your_friend(self, obj):
        request = self.context.get('request')
        if request.user is not None:
            if obj.id == request.user.id:
                return None
            try:
                user = PublicUser.objects.get(pk=request.user.id)
            except PublicUser.DoesNotExist:
                return None
            if user.friends.filter(id=obj.pk).exists():
                return True
            return False
        else :
            return None

    def get_friend_management(self, obj):
        request = self.context.get('request')
        if request.user is not None and request.user.id != obj.id:
            try:
                logged_user = PublicUser.objects.get(pk=request.user.id)
            except PublicUser.DoesNotExist:
                return None

            if logged_user.friends.filter(id=obj.pk).exists():
                return {
                    'action': 'remove',
                    'url': f'/api/users/{logged_user.username}/friends/delete/{obj.username}/'
                }
            else:
                return {
                    'action': 'add',
                    'url': f'/api/users/{logged_user.username}/friends/add/{obj.username}/'
                }
        return None

from os.path import exists
import requests
from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework import status
from rest_framework.views import APIView, Response
from .models import PublicUser
from .serializers import PublicUserDetailSerializer, PublicUserListSerializer
from .permissions import IsAuth, IsOwner, IsAvatarManager
from .authentification import CustomAuthentication
from ms_client.ms_client import MicroServiceClient, RequestsFailed

# Create your views here.

class PublicUserList(generics.ListAPIView):
    queryset = PublicUser.objects.all()
    serializer_class = PublicUserListSerializer
    lookup_field = 'username'

    def get_queryset(self):
        queryset = super().get_queryset()

        allowed_order_fields = [
                'username',
                'account_creation',
                'single_games_won',
                'single_games_lost',
                'tournament_games_won',
                'tournament_games_lost',
                'tournaments_won',
                'tournaments_lost',
                ]
        order_by = self.request.query_params.get('order_by')
        if order_by in allowed_order_fields:
            return PublicUser.objects.all().order_by(order_by)
        return queryset

class PublicUserRetrieveDetail(generics.RetrieveAPIView):
    queryset = PublicUser.objects.all()
    serializer_class = PublicUserDetailSerializer
    lookup_field = 'username'


class PublicUserCreate(generics.CreateAPIView) :
    permission_classes = [IsAuth]
    queryset = PublicUser.objects.all()
    serializer_class = PublicUserDetailSerializer

class PublicUserUpdate(generics.UpdateAPIView):
    permission_classes = [IsAuth]
    queryset = PublicUser.objects.all()
    serializer_class = PublicUserDetailSerializer
    lookup_field = 'username'

class PublicUserDelete(generics.DestroyAPIView):
    permission_classes = [IsAuth]
    queryset = PublicUser.objects.all()
    serializer_class = PublicUserDetailSerializer
    lookup_field = 'username'

class PublicUserIncrement(APIView):
    lookup_field = 'username'
    def patch(self, request, username, lookupfield):
        try:
            user = PublicUser.objects.get(username=username)
        except PublicUser.DoesNotExist:
            return Response({'error': 'user does not exists'}, status=status.HTTP_400_BAD_REQUEST)

        allowedFields = {
                'single_games_won':'single_games_won',
                'single_games_lost':'single_games_lost',
                'tournament_games_won':'tournament_games_won',
                'tournament_games_lost':'tournament_games_lost',
                'tournaments_won':'tournaments_won',
                'tournaments_lost':'tournaments_lost',
                }
        if lookupfield not in allowedFields:
            return Response({'error': 'field not found'}, status=status.HTTP_400_BAD_REQUEST)

        current_value = getattr(user, lookupfield, None)
        if current_value is None:
            return Response({'error': 'field not found'}, status=status.HTTP_400_BAD_REQUEST)

        setattr(user, lookupfield, current_value + 1)
        user.save()

        return Response({lookupfield: getattr(user, lookupfield, None)}, status=status.HTTP_200_OK)        

class PublicUserAddFriend(APIView):
    lookup_field = 'username'
    permission_classes = [IsOwner]
    def patch(self, request, username, friendusername):
        if username == friendusername:
            return Response(status=status.HTTP_304_NOT_MODIFIED)
        try:
            user = PublicUser.objects.get(username=username)
        except PublicUser.DoesNotExist:
            return Response({'error': 'user does not exists'}, status=status.HTTP_400_BAD_REQUEST)
        cur_friends = getattr(user, 'friends', None)
        try:
            new_friend = PublicUser.objects.get(username=friendusername)
        except PublicUser.DoesNotExist:
            return Response({'error': 'New friend does not exists'}, status=status.HTTP_400_BAD_REQUEST)
        if user.friends.filter(username=friendusername).exists():
            return Response(status=status.HTTP_304_NOT_MODIFIED)
        if cur_friends is None:
            return Response({'error': 'field not found'}, status=status.HTTP_400_BAD_REQUEST)
        user.friends.add(new_friend)
        user.save()

        return Response({'OK' : 'Successefully add the user as friend'}, status=status.HTTP_200_OK)

class PublicUserListFriends(generics.ListAPIView):
    serializer_class = PublicUserListSerializer
    lookup_field = 'username'
    permission_classes = [IsOwner]

    def get_queryset(self):
        username = self.kwargs.get('username')
        user = get_object_or_404(PublicUser, username=username)
        return user.friends.all()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class PublicUserRemoveFriend(APIView):
    permission_classes = [IsOwner]
    lookup_field = 'username'
    def delete(self,request, username, friendusername):
        if username == friendusername:
            return Response(status=status.HTTP_304_NOT_MODIFIED)
        try:
            user = PublicUser.objects.get(username=username)
        except PublicUser.DoesNotExist:
            return Response({'error': 'user does not exists'}, status=status.HTTP_400_BAD_REQUEST)
        cur_friends = getattr(user, 'friends', None)
        try:
            delete_friend = PublicUser.objects.get(username=friendusername)
        except PublicUser.DoesNotExist:
            return Response({'error': 'New friend does not exists'}, status=status.HTTP_400_BAD_REQUEST)
        if not user.friends.filter(username=friendusername).exists():
            return Response(status=status.HTTP_304_NOT_MODIFIED)
        if cur_friends is None:
            return Response({'error': 'field not found'}, status=status.HTTP_400_BAD_REQUEST)
        user.friends.remove(delete_friend)
        user.save()

        return Response({'OK' : 'Successefully delete the user from friend list'}, status=status.HTTP_200_OK)        

class PublicUserUpdateAvatar(APIView):
    permission_classes = [IsAvatarManager]
    lookup_field = 'username'
    def patch(self, request, username):
        try:
            user = PublicUser.objects.get(username=username)
        except PublicUser.DoesNotExist:
            return Response({'error': 'user does not exists'}, status=status.HTTP_400_BAD_REQUEST)
        path = request.data.get('avatar_path')
        if path is None:
            return Response({'error': 'Invalid body'}, status=status.HTTP_400_BAD_REQUEST)
        user.profilePic = path
        user.save()
        return Response({'OK': 'Successefully update the avatar'}, status=status.HTTP_200_OK)

class PublicUserSetDefaultAvatar(APIView):
    permission_classes = [IsOwner]
    lookup_field = 'username'
    def patch(self, request, username):
        try:
            user = PublicUser.objects.get(username=username)
        except PublicUser.DoesNotExist:
            return Response({'error': 'user does not exists'}, status=status.HTTP_400_BAD_REQUEST)
        path = request.data.get('profile_pic')
        if path is None:
            return Response({'error': 'Invalid body'}, status=status.HTTP_400_BAD_REQUEST)
        # if 'users_avatars' in user.profilePic:
        try:
            sender = MicroServiceClient()
            sender.send_requests(
                    urls=[f'http://avatars:8443/api/avatars/',],
                    method='delete',
                    expected_status=[204, 304],
                    body={'username':f'{user.username}'}
                    )
        except RequestsFailed:
            return Response({'error': 'Could not update avatar. Plz try again later'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        user.profilePic = path
        user.save()
        return Response({'OK':'Successefully reset the avatar'}, status=status.HTTP_200_OK)

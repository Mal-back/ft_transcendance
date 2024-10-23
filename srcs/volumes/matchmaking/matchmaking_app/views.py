from django.db.models import Q
from rest_framework import generics, status
from rest_framework.views import APIView, Response
from .models import MatchUser, Match
from .serializers import MatchUserSerializer, MatchSerializer
from .permissions import IsAuth, IsOwner, IsAuthenticated, IsInvitedPlayer

# Create your views here.

class MatchUserCreate(generics.CreateAPIView):
    queryset = MatchUser.objects.all()
    serializer_class = MatchUserSerializer 
    permission_classes = [IsAuth]

class MatchUserList(generics.ListAPIView):
    queryset = MatchUser.objects.all()
    serializer_class = MatchUserSerializer 

class MatchUserUpdate(generics.UpdateAPIView):
    queryset = MatchUser.objects.all()
    serializer_class = MatchUserSerializer 
    permission_classes = [IsAuth]
    lookup_field = 'username'

class MatchUserDelete(generics.UpdateAPIView):
    queryset = MatchUser.objects.all()
    serializer_class = MatchUserSerializer 
    permission_classes = [IsAuth]
    lookup_field = 'username'

class MatchCreate(generics.CreateAPIView):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(player1=self.request.user.username)
        return Response({'OK':'Invite sent'}, status=status.HTTP_201_CREATED)

class MatchGetPendingInvites(generics.ListAPIView):
    serializer_class = MatchSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Match.objects.filter(player2=user.username)

class MatchAcceptInvite(generics.UpdateAPIView):
    queryset = Match.objects.all()
    lookup_field = 'pk'
    permission_classes = [IsInvitedPlayer]

    def update(self, request, *args, **kwargs):
        username = self.request.user.username
        accepted_matches = Match.objects.filter(player2=username, status__in=['accepted', 'in_progress'])
        matches_as_player1 = Match.objects.filter(player1=username, status__in=['pending', 'accepted', 'in_progress'])
        if accepted_matches.exists() or matches_as_player1.exists():
            return Response({'Error':'You already send invites or have game in progress'}, status=status.HTTP_400_BAD_REQUEST)
        match = self.get_object()
        if match.status != 'pending':
            return Response({'Error':'You can\'t accept this match'}, status=status.HTTP_400_BAD_REQUEST)
        match.status = 'accepted'
        match.save()

        #Send Request to game to game ms

class MatchDeclineInvite(generics.UpdateAPIView):
    queryset = Match.objects.all()
    lookup_field = 'pk'
    permission_classes = [IsInvitedPlayer]

    def update(self, request, *args, **kwargs):
        match = self.get_object()
        if match.status != 'pending':
            return Response({'Error':'You can\'t declined this match'}, status=status.HTTP_400_BAD_REQUEST)
        match.status = 'declined'
        match.save()
        return Response({'OK':'Match Declined'}, status=status.HTTP_200_OK)

class MatchDeleteInvite(APIView):
    queryset = Match.objects.all()
    lookup_field = 'pk'
    permission_classes = [IsOwner]

    def delete(self, request, *args, **kwargs):
        match = self.get_object()
        if match.status != 'pending':
            return Response({'Error':'You can\'t cancel this match'}, status=status.HTTP_400_BAD_REQUEST)
        match.status = 'cancelled'
        return Response({'OK':'Match Cancelled'}, status=status.HTTP_200_OK)

class getAcceptedMatch(generics.RetrieveAPIView):
    queryset = Match.objects.all()

    def get_object(self):
        user = self.request.user.username
        queryset = self.get_queryset()
        obj = generics.get_object_or_404(queryset, Q(player1=user) | Q(player2=user), status='accepted')
        return obj

# Remain the view to handle finished game



from rest_framework import generics
from rest_framework import status
from rest_framework.views import APIView, Response
from .models import PublicUser
from .serializers import PublicUserDetailSerializer, PublicUserListSerializer

# Create your views here.

class PublicUserList(generics.ListAPIView):
    queryset = PublicUser.objects.all()
    serializer_class = PublicUserListSerializer

class PublicUserRetrieveDetail(generics.RetrieveAPIView):
    queryset = PublicUser.objects.all()
    serializer_class = PublicUserDetailSerializer

class PublicUserCreate(generics.CreateAPIView) :
    queryset = PublicUser.objects.all()
    serializer_class = PublicUserDetailSerializer

class PublicUserUpdate(generics.UpdateAPIView):
    queryset = PublicUser.objects.all()
    serializer_class = PublicUserDetailSerializer

class PublicUserDelete(generics.DestroyAPIView):
    queryset = PublicUser.objects.all()
    serializer_class = PublicUserDetailSerializer

class PublicUserIncrement(APIView):
    def patch(self, request, pk, lookupfield):
        try:
            user = PublicUser.objects.get(pk=pk)
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

        

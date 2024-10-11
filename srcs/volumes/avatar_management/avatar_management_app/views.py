from rest_framework import response, status
from rest_framework.views import APIView
from rest_framework.response import Response
from avatar_management_app.permissions import UserIsAuthenticated
from .serializers import UserAvatarSerializer
import os
from django.conf import settings
from ms_client import MicroServiceClient

# Create your views here

class AvatarView(APIView):
    permission_classes = [UserIsAuthenticated]
    def get(self, request, *args, **kwargs):
        links = ['http://localhost:8080/media/default_avatars/default_00.jpg',]
        return Response(links, status=200)

    def post(self, request, *args, **kwargs):
        serializer = UserAvatarSerializer(data=request.data)
        if serializer.is_valid():
            reset_avatar(request.user_username)
            try :
                save_image(request.user_username, serializer.validated_data)
            except Exception:
                return Response({'error':'Could not save the new avatar. Pease try again later'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            sender = MicroServiceClient()
            sender.send_requests(
                    urls=[''],
                    method='',
                    expected_status=[],
                    body={},
                    )
            return Response({'status':'new avatar successefully updated'}, status=201)
        return Response(serializer.errors, status=400)

    def delete(self, request, *args, **kwargs):
        if reset_avatar('tester') == True:
            return Response({'OK' : 'Successefully reset the avatar'}, status=status.HTTP_204_NO_CONTENT)
        return Response(status=status.HTTP_304_NOT_MODIFIED)

def save_image(username:str, validated_data) -> bool:
    file_path = os.path.join(settings.MEDIA_ROOT, 'users_avatars', f"{username}.{validated_data['image_type']}")
    with open(file_path, 'wb') as f:
        for chunk in validated_data['avatar'].chunks():
            f.write(chunk)
    return True

def reset_avatar(username:str):
    paths =  [
                os.path.join(settings.MEDIA_ROOT, 'users_avatars', f"{username}.png"),
                os.path.join(settings.MEDIA_ROOT, 'users_avatars', f"{username}.jpg"),
                os.path.join(settings.MEDIA_ROOT, 'users_avatars', f"{username}.jpeg"),
                ]
    for path in paths:
        print(path)
        if os.path.exists(path):
            os.remove(path)
            return True
    return False 

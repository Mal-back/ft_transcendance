from rest_framework import response, status
from rest_framework.views import APIView
from rest_framework.response import Response
from avatar_management_app.permissions import UserIsAuthenticated
from .serializers import UserAvatarSerializer
import os
from django.conf import settings
from ms_client.ms_client import MicroServiceClient, RequestsFailed
from .trad import translate

# Create your views here

class AvatarView(APIView):
    permission_classes = [UserIsAuthenticated]
    def get(self, request, *args, **kwargs):
        links = ['/media/default_avatars/default_00.jpg',]
        return Response(links, status=200)

    def post(self, request, *args, **kwargs):
        serializer = UserAvatarSerializer(data=request.data, context={'request': request})
        lang = request.headers.get('lang')
        if serializer.is_valid():
            data = serializer.save()
            reset_avatar(request.user_username)
            try :
                save_image(request.user_username, data)
            except Exception as e:
                message = translate(lang, "new_avatar_update_error")
                return Response({'error':message}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            try :
                img_type = data['image_type']
                sender = MicroServiceClient()
                sender.send_requests(
                        urls=[f'http://users:8443/api/users/{request.user_username}/update_pic/',],
                        method='patch',
                        expected_status=[200],
                        body={'avatar_path':f'/media/users_avatars/{request.user_username}.{img_type}'},
                        )
                message = translate(lang, "new_avatar_update_success")
                return Response({'status':message}, status=201)
            except RequestsFailed:
                message = translate(lang, "image_upload_error")
                return Response({'error': message}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=400)

    def patch(self, request, *args, **kwargs):
        old_username = request.data.get('old_username')
        new_username = request.data.get('new_username')
        if rename_avatar(old_username, new_username) == True:
            return Response({'Ok': 'Kr'}, status=status.HTTP_200_OK)
        return Response(status=status.HTTP_304_NOT_MODIFIED)

    def delete(self, request, *args, **kwargs):
        lang = request.headers.get('lang')
        if reset_avatar(request.data.get('username')) == True:
            message = translate(lang, "reset_avatar_success")
            return Response({'OK' : message}, status=status.HTTP_204_NO_CONTENT)
        return Response(status=status.HTTP_304_NOT_MODIFIED)

def save_image(username:str, validated_data) -> bool:
    try:
        os.mkdir(os.path.join(settings.MEDIA_ROOT, 'users_avatars'))
    except OSError:
        pass
    file_path = os.path.join(settings.MEDIA_ROOT, 'users_avatars', f"{username}.{validated_data['image_type']}")
    print(file_path)
    with open(file_path, 'wb') as f:
        for chunk in validated_data['avatar'].chunks():
            f.write(chunk)
    return True

def rename_avatar(old_username:str, new_username:str):
    paths =  [
                os.path.join(settings.MEDIA_ROOT, 'users_avatars', f"{old_username}.png"),
                os.path.join(settings.MEDIA_ROOT, 'users_avatars', f"{old_username}.jpg"),
                os.path.join(settings.MEDIA_ROOT, 'users_avatars', f"{old_username}.jpeg"),
                ]
    for path in paths:
        if os.path.exists(path):
            old_path = str(path)
            new_path = old_path.replace(old_username, new_username)
            os.rename(old_path, new_path)
            return True
    return False 

def reset_avatar(username:str):
    paths =  [
                os.path.join(settings.MEDIA_ROOT, 'users_avatars', f"{username}.png"),
                os.path.join(settings.MEDIA_ROOT, 'users_avatars', f"{username}.jpg"),
                os.path.join(settings.MEDIA_ROOT, 'users_avatars', f"{username}.jpeg"),
                ]
    for path in paths:
        if os.path.exists(path):
            os.remove(path)
            return True
    return False 

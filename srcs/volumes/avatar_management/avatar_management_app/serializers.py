from rest_framework import serializers
from PIL import Image
from .trad import translate

class UserAvatarSerializer(serializers.Serializer):
    avatar = serializers.ImageField(required=True)
    image_type = serializers.CharField(read_only=True)

    def validate_avatar(self, value):
        request = self.context.get('request')
        lang = request.headers.get('lang')
        cur = value.tell()
        try :
            img = Image.open(value)
            img.verify()
        except (IOError, SyntaxError):
            message = translate(lang,"invalid_image_error")
            raise serializers.ValidationError(message)

        if img.format not in ['JPEG', 'PNG', 'JPG']:
            message = translate(lang, "image_format_error")
            raise serializers.ValidationError(message)

        self.context['image_type'] = img.format.lower() 

        value.seek(0)

        if value.size > 5 * 1024 * 1024 :
            message = translate(lang, "image_size_error")
            raise serializers.ValidationError(message)

        value.seek(cur)

        return value
    
    def create(self, validated_data):
        image_type = self.context.get('image_type')
        validated_data['image_type'] = image_type
        return validated_data

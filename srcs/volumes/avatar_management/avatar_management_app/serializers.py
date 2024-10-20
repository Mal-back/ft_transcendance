from rest_framework import serializers
from PIL import Image

class UserAvatarSerializer(serializers.Serializer):
    avatar = serializers.ImageField(required=True)
    image_type = serializers.CharField(required=True)

    def validate_avatar(self, value):
        cur = value.tell()
        try :
            img = Image.open(value)
            img.verify()
        except (IOError, SyntaxError):
            raise serializers.ValidationError('Invalid image. Please uplaod a valid image')

        if img.format not in ['JPEG', 'PNG', 'JPG']:
            raise serializers.ValidationError('Only JPG, JPEG or PNG iamges are allowed')

        self.context['image_type'] = img.format.lower() 

        value.seek(0)

        if value.size > 5 * 1024 * 1024 :
            raise serializers.ValidationError('Image size should not exceed 5mb.')

        value.seek(cur)

        return value
    
    def create(self, validated_data):
        image_type = self.context.get('image_type')
        validated_data['image_type'] = image_type
        return validated_data

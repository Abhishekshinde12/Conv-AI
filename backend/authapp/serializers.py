from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from .models import MyUser

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    # using email for auth
    username_field = 'email'

    # in django self.user => current logged in user or None
    # hence when we validate user, if correctly validated self.user is set to current new user
    # and then tokens are added to the data dict
    def validate(self, attrs):
        data = super().validate(attrs)
        user_data = {
            'access_token': data['access'],
            'refresh_token': data['refresh'],
            'user': {
                'user_name': f'{self.user.first_name} {self.user.last_name}',
                'user_id': self.user.id,
                'user_type': self.user.user_type
            }
        }
        return user_data
        

class MyUserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = MyUser
        fields = ('first_name', 'last_name', 'email', 'password', 'user_type')

    def create(self, validated_data):
        email = validated_data.pop('email')
        password = validated_data.pop('password')
        # here we use create_user instead of create
        # as internally it takes care of normalizing email, setting password hash
        # it's the custom user models manager method to create new user
        user = MyUser.objects.create_user(email=email, password=password,**validated_data)
        return user
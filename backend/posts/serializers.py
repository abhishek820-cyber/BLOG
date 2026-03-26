from rest_framework import serializers
from .models import Post
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed

class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = '__all__'

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        # 🚨 BLOCK UNVERIFIED USERS
        if not self.user.is_active:
            raise AuthenticationFailed("Please verify your email first")

        return data
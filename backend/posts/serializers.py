from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Post, UserProfile, Like, Comment


def resolve_avatar(profile, request):
    """Single place to get avatar URL — works for both Cloudinary and local."""
    if not profile or not profile.avatar:
        return None
    try:
        return profile.get_avatar_url(request)
    except Exception:
        return None


class CommentSerializer(serializers.ModelSerializer):
    username    = serializers.CharField(source='user.username', read_only=True)
    avatar_url  = serializers.SerializerMethodField()

    class Meta:
        model  = Comment
        fields = ['id', 'username', 'avatar_url', 'text', 'created_at']
        read_only_fields = ['id', 'username', 'avatar_url', 'created_at']

    def get_avatar_url(self, obj):
        request = self.context.get('request')
        try:
            return resolve_avatar(obj.user.profile, request)
        except Exception:
            return None


class PostSerializer(serializers.ModelSerializer):
    """Owner-only — used in My Posts / Profile."""
    class Meta:
        model  = Post
        fields = ['id', 'title', 'content', 'created_at']
        read_only_fields = ['id', 'created_at']


class PublicPostSerializer(serializers.ModelSerializer):
    """All Posts feed — includes author info and social counts."""
    author        = serializers.CharField(source='user.username', read_only=True)
    author_avatar = serializers.SerializerMethodField()
    like_count    = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    liked_by_me   = serializers.SerializerMethodField()

    class Meta:
        model  = Post
        fields = [
            'id', 'title', 'content', 'created_at',
            'author', 'author_avatar',
            'like_count', 'comment_count', 'liked_by_me',
        ]

    def get_author_avatar(self, obj):
        request = self.context.get('request')
        try:
            return resolve_avatar(obj.user.profile, request)
        except Exception:
            return None

    def get_like_count(self, obj):
        return obj.likes.count()

    def get_comment_count(self, obj):
        return obj.comments.count()

    def get_liked_by_me(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(min_length=8, write_only=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            is_active=True,
        )
        UserProfile.objects.create(user=user)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    username   = serializers.CharField(source='user.username', read_only=True)
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model  = UserProfile
        fields = ['username', 'bio', 'avatar', 'avatar_url', 'updated_at']
        read_only_fields  = ['username', 'avatar_url', 'updated_at']
        extra_kwargs = {'avatar': {'required': False, 'allow_null': True}}

    def get_avatar_url(self, obj):
        request = self.context.get('request')
        return resolve_avatar(obj, request)
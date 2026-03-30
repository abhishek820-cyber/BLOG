from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from .models import Post, UserProfile
from .serializers import PostSerializer, RegisterSerializer, UserProfileSerializer


# ── Health check ──────────────────────────────────────────────────────────────

@api_view(["GET"])
def test_api(request):
    return Response({"message": "API is working perfectly"})


# ── Posts — scoped to the logged-in user ─────────────────────────────────────

class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Post.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# ── Register ──────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(
            {"message": "Account created! You can now log in."},
            status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ── Get & update profile (bio + avatar) ──────────────────────────────────────

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile(request):
    # Auto-create profile if missing (for accounts created before this feature)
    user_profile, _ = UserProfile.objects.get_or_create(user=request.user)

    if request.method == 'GET':
        serializer = UserProfileSerializer(user_profile, context={'request': request})
        return Response(serializer.data)

    # PATCH — update bio and/or avatar
    serializer = UserProfileSerializer(
        user_profile,
        data=request.data,
        partial=True,
        context={'request': request}
    )
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ── Delete avatar only ────────────────────────────────────────────────────────

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_avatar(request):
    user_profile, _ = UserProfile.objects.get_or_create(user=request.user)
    if user_profile.avatar:
        user_profile.avatar.delete(save=True)
    return Response({"message": "Avatar removed."}, status=status.HTTP_200_OK)


# ── Change password ───────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    old_password = request.data.get('old_password', '')
    new_password = request.data.get('new_password', '')

    if not old_password or not new_password:
        return Response(
            {"error": "Both old and new passwords are required."},
            status=status.HTTP_400_BAD_REQUEST
        )
    if not user.check_password(old_password):
        return Response(
            {"error": "Current password is incorrect."},
            status=status.HTTP_400_BAD_REQUEST
        )
    if len(new_password) < 8:
        return Response(
            {"error": "New password must be at least 8 characters."},
            status=status.HTTP_400_BAD_REQUEST
        )
    user.set_password(new_password)
    user.save()
    return Response({"message": "Password changed successfully."})
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.db.models import Q
from .models import Post, UserProfile, Like, Comment
from .serializers import (
    PostSerializer, PublicPostSerializer,
    RegisterSerializer, UserProfileSerializer, CommentSerializer
)


# ── Health check ──────────────────────────────────────────────────────────────

@api_view(["GET"])
def test_api(request):
    return Response({"message": "API is working perfectly"})


# ── My Posts (owner only) ─────────────────────────────────────────────────────

class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Post.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# ── All Posts (public — anyone logged in can read) ────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def all_posts(request):
    search = request.query_params.get('search', '').strip()
    posts = Post.objects.select_related('user', 'user__profile').order_by('-created_at')

    if search:
        posts = posts.filter(
            Q(title__icontains=search) |
            Q(content__icontains=search) |
            Q(user__username__icontains=search)
        )

    serializer = PublicPostSerializer(posts, many=True, context={'request': request})
    return Response(serializer.data)


# ── Single public post detail ─────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def post_detail(request, pk):
    try:
        post = Post.objects.select_related('user', 'user__profile').get(pk=pk)
    except Post.DoesNotExist:
        return Response({"error": "Post not found."}, status=status.HTTP_404_NOT_FOUND)
    serializer = PublicPostSerializer(post, context={'request': request})
    return Response(serializer.data)


# ── Like / Unlike ─────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_like(request, pk):
    try:
        post = Post.objects.get(pk=pk)
    except Post.DoesNotExist:
        return Response({"error": "Post not found."}, status=status.HTTP_404_NOT_FOUND)

    like, created = Like.objects.get_or_create(user=request.user, post=post)
    if not created:
        like.delete()
        liked = False
    else:
        liked = True

    return Response({
        "liked": liked,
        "like_count": post.likes.count(),
    })


# ── Comments ──────────────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def post_comments(request, pk):
    try:
        post = Post.objects.get(pk=pk)
    except Post.DoesNotExist:
        return Response({"error": "Post not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        comments = post.comments.select_related('user', 'user__profile')
        return Response(CommentSerializer(comments, many=True, context={'request': request}).data)

    # POST — add a comment
    text = request.data.get('text', '').strip()
    if not text:
        return Response({"error": "Comment text is required."}, status=status.HTTP_400_BAD_REQUEST)
    if len(text) > 1000:
        return Response({"error": "Comment too long (max 1000 characters)."}, status=status.HTTP_400_BAD_REQUEST)

    comment = Comment.objects.create(user=request.user, post=post, text=text)
    return Response(
        CommentSerializer(comment, context={'request': request}).data,
        status=status.HTTP_201_CREATED
    )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_comment(request, pk):
    try:
        comment = Comment.objects.get(pk=pk)
    except Comment.DoesNotExist:
        return Response({"error": "Comment not found."}, status=status.HTTP_404_NOT_FOUND)

    if comment.user != request.user:
        return Response({"error": "You can only delete your own comments."}, status=status.HTTP_403_FORBIDDEN)

    comment.delete()
    return Response({"message": "Comment deleted."})


# ── Register ──────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Account created! You can now log in."}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ── Profile ───────────────────────────────────────────────────────────────────

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile(request):
    user_profile, _ = UserProfile.objects.get_or_create(user=request.user)
    if request.method == 'GET':
        return Response(UserProfileSerializer(user_profile, context={'request': request}).data)
    serializer = UserProfileSerializer(user_profile, data=request.data, partial=True, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_avatar(request):
    import os
    user_profile, _ = UserProfile.objects.get_or_create(user=request.user)
    if user_profile.avatar:
        if os.environ.get('CLOUDINARY_URL'):
            # Delete from Cloudinary
            import cloudinary.uploader
            try:
                public_id = user_profile.avatar.public_id
                cloudinary.uploader.destroy(public_id)
            except Exception:
                pass
            user_profile.avatar = None
            user_profile.save()
        else:
            user_profile.avatar.delete(save=True)
    return Response({"message": "Avatar removed."})


# ── Change password ───────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    old_password = request.data.get('old_password', '')
    new_password = request.data.get('new_password', '')
    if not old_password or not new_password:
        return Response({"error": "Both passwords are required."}, status=status.HTTP_400_BAD_REQUEST)
    if not user.check_password(old_password):
        return Response({"error": "Current password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)
    if len(new_password) < 8:
        return Response({"error": "New password must be at least 8 characters."}, status=status.HTTP_400_BAD_REQUEST)
    user.set_password(new_password)
    user.save()
    return Response({"message": "Password changed successfully."})
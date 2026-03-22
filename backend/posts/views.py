from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Post
from .serializers import PostSerializer
from django.contrib.auth.models import User

# ✅ KEEP THIS
@api_view(["GET"])
def test_api(request):
    return Response({"message": "API is working perfectly"})

# ✅ NEW CRUD VIEW
class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer

@api_view(['POST'])
def register(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = User.objects.create_user(username=username, password=password)
    return Response({"message": "User created"})
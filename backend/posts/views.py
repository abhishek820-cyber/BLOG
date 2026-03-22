from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Post
from .serializers import PostSerializer

# ✅ KEEP THIS
@api_view(["GET"])
def test_api(request):
    return Response({"message": "API is working perfectly"})

# ✅ NEW CRUD VIEW
class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
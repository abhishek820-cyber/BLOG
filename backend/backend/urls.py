from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from posts.views import PostViewSet, test_api

router = DefaultRouter()
router.register('posts', PostViewSet)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/test/", test_api),
    path("api/", include(router.urls)),
]
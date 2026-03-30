from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from posts.views import (
    PostViewSet, test_api, register,
    profile, delete_avatar, change_password
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register('posts', PostViewSet, basename='post')

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/test/", test_api),
    path("api/", include(router.urls)),
    path("api/token/", TokenObtainPairView.as_view()),
    path("api/token/refresh/", TokenRefreshView.as_view()),
    path("api/register/", register),
    path("api/profile/", profile),
    path("api/profile/avatar/", delete_avatar),
    path("api/change-password/", change_password),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
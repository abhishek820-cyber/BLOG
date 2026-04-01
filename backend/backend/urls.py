from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from posts.views import (
    PostViewSet, test_api,
    publish_post, unpublish_post,
    all_posts, post_detail,
    toggle_like, post_comments, delete_comment,
    register, profile, delete_avatar, change_password
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
    # Draft → publish shortcuts
    path("api/posts/<int:pk>/publish/",   publish_post),
    path("api/posts/<int:pk>/unpublish/", unpublish_post),
    # Public explore feed
    path("api/all-posts/",              all_posts),
    path("api/all-posts/<int:pk>/",     post_detail),
    path("api/all-posts/<int:pk>/like/",     toggle_like),
    path("api/all-posts/<int:pk>/comments/", post_comments),
    path("api/comments/<int:pk>/",      delete_comment),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
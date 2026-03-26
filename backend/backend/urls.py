from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from posts.views import (
    PostViewSet,
    test_api,
    register,
    verify_email,
    resend_verification,
    CustomLoginView   # ✅ IMPORTANT
)
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register('posts', PostViewSet)

urlpatterns = [
    path("admin/", admin.site.urls),

    # Test API
    path("api/test/", test_api),

    # Posts CRUD
    path("api/", include(router.urls)),

    # 🔐 AUTH
    path('api/token/', CustomLoginView.as_view()),   # ✅ FIXED (was TokenObtainPairView)
    path('api/token/refresh/', TokenRefreshView.as_view()),

    # 👤 USER
    path('api/register/', register),
    path('api/verify-email/', verify_email),       # GET ?token=<uuid>
    path('api/resend-verification/', resend_verification),  # POST {email}
]
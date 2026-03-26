from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.conf import settings
from .models import Post, EmailVerificationToken
from .serializers import PostSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer
from rest_framework.permissions import IsAuthenticated
# ── Existing test endpoint ────────────────────────────────────────────────────

@api_view(["GET"])
def test_api(request):
    return Response({"message": "API is working perfectly"})


# ── Post CRUD ─────────────────────────────────────────────────────────────────

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Post.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

# ── Register: create user + send verification email ──────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    username = request.data.get('username', '').strip()
    email    = request.data.get('email', '').strip()
    password = request.data.get('password', '').strip()

    # Basic validation
    if not username or not email or not password:
        return Response(
            {"error": "Username, email and password are all required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(username=username).exists():
        return Response(
            {"error": "Username already taken."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(email=email).exists():
        return Response(
            {"error": "An account with this email already exists."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Create user — inactive until email is verified
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        is_active=False          # ← cannot log in yet
    )

    # Create verification token
    token_obj = EmailVerificationToken.objects.create(user=user)

    # Build the verification link
    verify_url = (
        f"{settings.FRONTEND_URL}/verify-email?token={token_obj.token}"
    )

    # Send the email
    send_mail(
        subject="Verify your email — The Daily Post",
        message=(
            f"Hi {username},\n\n"
            f"Thanks for signing up! Please verify your email by clicking the link below:\n\n"
            f"{verify_url}\n\n"
            f"This link will remain active. If you didn't sign up, ignore this email.\n\n"
            f"— The Daily Post"
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=False,
    )

    return Response(
        {"message": "Account created! Please check your email to verify your account."},
        status=status.HTTP_201_CREATED
    )


# ── Verify email endpoint ─────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([AllowAny])
def verify_email(request):
    token = request.query_params.get('token')

    if not token:
        return Response(
            {"error": "Verification token is missing."},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        token_obj = EmailVerificationToken.objects.get(token=token)
    except EmailVerificationToken.DoesNotExist:
        return Response(
            {"error": "Invalid or expired verification link."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Activate the user
    user = token_obj.user
    user.is_active = True
    user.save()

    # Delete the token — one-time use
    token_obj.delete()

    return Response(
        {"message": "Email verified! You can now log in."},
        status=status.HTTP_200_OK
    )


# ── Resend verification email ─────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def resend_verification(request):
    email = request.data.get('email', '').strip()

    if not email:
        return Response(
            {"error": "Email is required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        # Don't reveal if email exists or not
        return Response(
            {"message": "If that email is registered, a new verification link has been sent."},
            status=status.HTTP_200_OK
        )

    if user.is_active:
        return Response(
            {"error": "This account is already verified."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Delete old token if exists, create new one
    EmailVerificationToken.objects.filter(user=user).delete()
    token_obj = EmailVerificationToken.objects.create(user=user)

    verify_url = (
         f"{settings.FRONTEND_URL}/verify-email?token={token_obj.token}"    )

    send_mail(
        subject="New verification link — The Daily Post",
        message=(
            f"Hi {user.username},\n\n"
            f"Here's your new verification link:\n\n"
            f"{verify_url}\n\n"
            f"— The Daily Post"
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=False,
    )

    return Response(
        {"message": "If that email is registered, a new verification link has been sent."},
        status=status.HTTP_200_OK
    )
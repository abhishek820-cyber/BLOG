from django.db import models
from django.contrib.auth.models import User
import uuid

class Post(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
    
class EmailVerificationToken(models.Model):
    """One token per user — created on register, deleted on verify."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='verification_token')
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
 
    def __str__(self):
        return f"Token for {self.user.username}"
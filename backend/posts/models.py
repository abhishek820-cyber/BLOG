from django.db import models
from django.contrib.auth.models import User
import os

if os.environ.get('CLOUDINARY_URL'):
    from cloudinary.models import CloudinaryField
    AvatarField = lambda: CloudinaryField(
        'avatar', folder='blog_avatars', blank=True, null=True,
        transformation={'width': 400, 'height': 400, 'crop': 'fill', 'gravity': 'face'},
    )
else:
    def AvatarField():
        return models.ImageField(upload_to='avatars/', blank=True, null=True)


class Post(models.Model):
    STATUS_DRAFT     = 'draft'
    STATUS_PUBLISHED = 'published'
    STATUS_CHOICES   = [
        (STATUS_DRAFT,     'Draft'),
        (STATUS_PUBLISHED, 'Published'),
    ]

    user       = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    title      = models.CharField(max_length=200)
    content    = models.TextField()
    status     = models.CharField(max_length=12, choices=STATUS_CHOICES, default=STATUS_DRAFT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)      # tracks last save/edit

    def __str__(self):
        return f"[{self.status.upper()}] {self.title}"

    @property
    def like_count(self):
        return self.likes.count()

    @property
    def comment_count(self):
        return self.comments.count()


class UserProfile(models.Model):
    user       = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio        = models.TextField(blank=True, default='')
    avatar     = AvatarField()
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile of {self.user.username}"

    def get_avatar_url(self, request=None):
        if not self.avatar:
            return None
        if os.environ.get('CLOUDINARY_URL'):
            try:
                return self.avatar.url
            except Exception:
                return None
        if request:
            return request.build_absolute_uri(self.avatar.url)
        return self.avatar.url


class Like(models.Model):
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='likes')
    post       = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'post')

    def __str__(self):
        return f"{self.user.username} liked '{self.post.title}'"


class Comment(models.Model):
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    post       = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    text       = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.user.username} on '{self.post.title}'"
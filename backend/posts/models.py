from django.db import models
from django.contrib.auth.models import User

# Use CloudinaryField only if Cloudinary is configured, else fall back to ImageField
import os
if os.environ.get('CLOUDINARY_URL'):
    from cloudinary.models import CloudinaryField
    AvatarField = lambda: CloudinaryField(
        'avatar',
        folder='blog_avatars',
        blank=True,
        null=True,
        transformation={'width': 400, 'height': 400, 'crop': 'fill', 'gravity': 'face'},
    )
else:
    def AvatarField():
        return models.ImageField(upload_to='avatars/', blank=True, null=True)


class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    @property
    def like_count(self):
        return self.likes.count()

    @property
    def comment_count(self):
        return self.comments.count()


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True, default='')
    avatar = AvatarField()
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile of {self.user.username}"

    def get_avatar_url(self, request=None):
        """Return Cloudinary CDN URL or local media URL depending on environment."""
        if not self.avatar:
            return None
        # CloudinaryField has a .url property that returns the full CDN URL
        if os.environ.get('CLOUDINARY_URL'):
            try:
                return self.avatar.url
            except Exception:
                return None
        # Local ImageField
        if request:
            return request.build_absolute_uri(self.avatar.url)
        return self.avatar.url


class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='likes')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'post')

    def __str__(self):
        return f"{self.user.username} liked '{self.post.title}'"


class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.user.username} on '{self.post.title}'"
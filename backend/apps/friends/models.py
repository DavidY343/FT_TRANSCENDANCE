import uuid
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError

User = settings.AUTH_USER_MODEL

# Tabla friendships
class Friendship(models.Model):
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("ACCEPTED", "Accepted"),
        ("DECLINED", "Declined"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friendships_sent")
    addressee = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friendships_received")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="PENDING")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("requester", "addressee")

    def clean(self):
        if self.requester == self.addressee:
            raise ValidationError("No puedes enviarte una solicitud a ti mismo.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
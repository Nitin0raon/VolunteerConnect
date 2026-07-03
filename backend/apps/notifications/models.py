"""
In-app notification model (paired with synchronous email sending).
"""
from django.conf import settings
from django.db import models


class NotificationType(models.TextChoices):
    NGO_APPROVED = 'ngo_approved', 'NGO Approved'
    NGO_REJECTED = 'ngo_rejected', 'NGO Rejected'
    VOLUNTEER_JOINED = 'volunteer_joined', 'Volunteer Joined'
    VOLUNTEER_LEFT = 'volunteer_left', 'Volunteer Left'
    WAITLIST_PROMOTED = 'waitlist_promoted', 'Waitlist Promoted'


class Notification(models.Model):
    """A notification record shown to the user in-app."""

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
    )
    notification_type = models.CharField(max_length=30, choices=NotificationType.choices)
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications_notification'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
        ]

    def __str__(self):
        return f'{self.notification_type} → {self.recipient.email}'

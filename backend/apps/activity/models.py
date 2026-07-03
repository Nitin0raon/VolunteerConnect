"""
Activity feed model — stores important user-facing actions.
"""
from django.conf import settings
from django.db import models


class ActivityAction(models.TextChoices):
    PROGRAM_CREATED = 'program_created', 'Program Created'
    PROGRAM_UPDATED = 'program_updated', 'Program Updated'
    PROGRAM_DELETED = 'program_deleted', 'Program Deleted'
    VOLUNTEER_JOINED = 'volunteer_joined', 'Volunteer Joined'
    VOLUNTEER_LEFT = 'volunteer_left', 'Volunteer Left'
    VOLUNTEER_WAITLISTED = 'volunteer_waitlisted', 'Volunteer Waitlisted'
    WAITLIST_PROMOTED = 'waitlist_promoted', 'Waitlist Promoted'
    NGO_APPROVED = 'ngo_approved', 'NGO Approved'
    NGO_REJECTED = 'ngo_rejected', 'NGO Rejected'
    CERTIFICATE_GENERATED = 'certificate_generated', 'Certificate Generated'


class Activity(models.Model):
    """A single entry in a user's activity feed."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='activities',
    )
    action = models.CharField(max_length=50, choices=ActivityAction.choices, db_index=True)
    description = models.CharField(max_length=500)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = 'activity_activity'
        verbose_name = 'Activity'
        verbose_name_plural = 'Activities'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
        ]

    def __str__(self):
        return f'{self.user.email} - {self.action} @ {self.created_at}'

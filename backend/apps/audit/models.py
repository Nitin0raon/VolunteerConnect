"""
Audit log model — tracks sensitive system actions for compliance.
"""
from django.conf import settings
from django.db import models


class AuditAction(models.TextChoices):
    LOGIN = 'login', 'Login'
    LOGOUT = 'logout', 'Logout'
    REGISTER = 'register', 'Register'
    NGO_APPROVED = 'ngo_approved', 'NGO Approved'
    NGO_REJECTED = 'ngo_rejected', 'NGO Rejected'
    PROGRAM_CREATED = 'program_created', 'Program Created'
    PROGRAM_UPDATED = 'program_updated', 'Program Updated'
    PROGRAM_DELETED = 'program_deleted', 'Program Deleted'
    PARTICIPATION_JOINED = 'participation_joined', 'Participation Joined'
    PARTICIPATION_LEFT = 'participation_left', 'Participation Left'


class AuditLog(models.Model):
    """Immutable audit trail record."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs',
    )
    action = models.CharField(max_length=50, choices=AuditAction.choices, db_index=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    old_values = models.JSONField(default=dict, blank=True)
    new_values = models.JSONField(default=dict, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = 'audit_log'
        verbose_name = 'Audit Log'
        verbose_name_plural = 'Audit Logs'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['action', '-timestamp']),
            models.Index(fields=['user', '-timestamp']),
        ]

    def __str__(self):
        return f'{self.action} by {self.user} @ {self.timestamp}'

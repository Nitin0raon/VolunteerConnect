"""
Participation model — tracks volunteer enrollment in programs, including waitlist.
"""
from django.conf import settings
from django.db import models
from apps.programs.models import Program


class ParticipationStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    JOINED = 'joined', 'Joined'
    WAITLISTED = 'waitlisted', 'Waitlisted'
    REJECTED = 'rejected', 'Rejected'
    LEFT = 'left', 'Left'
    COMPLETED = 'completed', 'Completed'


class Participation(models.Model):
    """Tracks a volunteer's participation request in a program."""

    volunteer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='participations',
    )
    program = models.ForeignKey(
        Program,
        on_delete=models.CASCADE,
        related_name='participations',
    )
    status = models.CharField(
        max_length=20,
        choices=ParticipationStatus.choices,
        default=ParticipationStatus.PENDING,
        db_index=True,
    )
    waitlist_position = models.PositiveIntegerField(null=True, blank=True)
    message = models.TextField(blank=True, help_text='Optional message from volunteer when requesting to join')
    joined_at = models.DateTimeField(null=True, blank=True)
    left_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    requested_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'participation_participation'
        verbose_name = 'Participation'
        verbose_name_plural = 'Participations'
        ordering = ['-requested_at']
        indexes = [
            models.Index(fields=['program', 'status']),
            models.Index(fields=['volunteer', 'status']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['volunteer', 'program'],
                condition=models.Q(status__in=['pending', 'joined', 'waitlisted']),
                name='unique_active_participation',
            )
        ]

    def __str__(self):
        return f'{self.volunteer.email} -> {self.program.title} ({self.status})'
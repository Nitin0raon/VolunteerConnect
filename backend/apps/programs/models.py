"""
Program model — volunteer opportunities created by approved NGOs.
"""
from django.core.exceptions import ValidationError
from django.db import models
from apps.ngos.models import NGOProfile


class ProgramStatus(models.TextChoices):
    ACTIVE = 'active', 'Active'
    COMPLETED = 'completed', 'Completed'
    CANCELLED = 'cancelled', 'Cancelled'


class Program(models.Model):
    """A volunteer program/opportunity created by an approved NGO."""

    ngo = models.ForeignKey(
        NGOProfile,
        on_delete=models.CASCADE,
        related_name='programs',
    )
    title = models.CharField(max_length=255, db_index=True)
    description = models.TextField()
    capacity = models.PositiveIntegerField()
    current_participants = models.PositiveIntegerField(default=0)
    status = models.CharField(
        max_length=20,
        choices=ProgramStatus.choices,
        default=ProgramStatus.ACTIVE,
        db_index=True,
    )
    location = models.CharField(max_length=255, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'programs_program'
        verbose_name = 'Program'
        verbose_name_plural = 'Programs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'ngo']),
            models.Index(fields=['title']),
        ]

    def __str__(self):
        return f'{self.title} ({self.ngo.organization_name})'

    def clean(self):
        if self.capacity is not None and self.capacity <= 0:
            raise ValidationError({'capacity': 'Capacity must be greater than zero.'})
        if self.capacity is not None and self.current_participants > self.capacity:
            raise ValidationError({'capacity': 'Cannot reduce capacity below current participants.'})

    @property
    def is_full(self):
        return self.current_participants >= self.capacity

    @property
    def available_slots(self):
        return max(0, self.capacity - self.current_participants)

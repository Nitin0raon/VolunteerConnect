"""
NGO profile model with approval workflow.
"""
from django.db import models
from django.conf import settings


class NGOStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    APPROVED = 'approved', 'Approved'
    REJECTED = 'rejected', 'Rejected'


class NGOProfile(models.Model):
    """
    Extended profile for NGO users.
    Created automatically when a user with role=ngo registers.
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ngo_profile',
    )
    organization_name = models.CharField(max_length=255, db_index=True)
    description = models.TextField()
    website = models.URLField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=NGOStatus.choices,
        default=NGOStatus.PENDING,
        db_index=True,
    )
    rejection_reason = models.TextField(blank=True)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_ngos',
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'ngos_profile'
        verbose_name = 'NGO Profile'
        verbose_name_plural = 'NGO Profiles'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at']),
        ]

    def __str__(self):
        return f'{self.organization_name} ({self.status})'

    @property
    def is_approved(self):
        return self.status == NGOStatus.APPROVED

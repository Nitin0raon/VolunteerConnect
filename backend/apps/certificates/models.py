"""
Certificate model — generated PDF certificates for completed volunteers.
"""
import uuid
from django.conf import settings
from django.db import models
from apps.programs.models import Program


def certificate_upload_path(instance, filename):
    return f'certificates/{instance.certificate_number}.pdf'


class Certificate(models.Model):
    """A PDF completion certificate issued to a volunteer for a program."""

    volunteer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='certificates',
    )
    program = models.ForeignKey(
        Program,
        on_delete=models.CASCADE,
        related_name='certificates',
    )
    certificate_number = models.CharField(max_length=50, unique=True, db_index=True, editable=False)
    file = models.FileField(upload_to=certificate_upload_path)
    issued_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'certificates_certificate'
        ordering = ['-issued_at']
        constraints = [
            models.UniqueConstraint(fields=['volunteer', 'program'], name='unique_certificate_per_program'),
        ]

    def __str__(self):
        return f'{self.certificate_number} - {self.volunteer.email}'

    def save(self, *args, **kwargs):
        if not self.certificate_number:
            self.certificate_number = f'CERT-{uuid.uuid4().hex[:12].upper()}'
        super().save(*args, **kwargs)

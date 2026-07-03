"""
Service for recording audit log entries.
"""
from apps.audit.models import AuditLog


class AuditService:
    """Centralized helper for writing audit trail entries."""

    @staticmethod
    def log(user, action: str, ip_address: str = None, old_values: dict = None, new_values: dict = None):
        return AuditLog.objects.create(
            user=user,
            action=action,
            ip_address=ip_address,
            old_values=old_values or {},
            new_values=new_values or {},
        )

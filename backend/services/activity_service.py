"""
Service for recording activity feed entries.
"""
from apps.activity.models import Activity


class ActivityService:
    """Centralized helper for logging activity feed entries."""

    @staticmethod
    def log(user, action: str, description: str, metadata: dict = None):
        return Activity.objects.create(
            user=user,
            action=action,
            description=description,
            metadata=metadata or {},
        )

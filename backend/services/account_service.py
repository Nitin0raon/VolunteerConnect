"""
Business logic for account registration.
"""
import logging
from apps.accounts.models import UserRole
from apps.audit.models import AuditLog, AuditAction
from apps.ngos.models import NGOProfile, NGOStatus
from repositories.user_repository import UserRepository

logger = logging.getLogger('services')


class AccountService:
    """Service layer for user account operations."""

    @staticmethod
    def register(validated_data: dict):
        user = UserRepository.create(**validated_data)

        # Auto-create and auto-approve NGO profile on registration
        if user.role == UserRole.NGO:
            NGOProfile.objects.create(
                user=user,
                organization_name=f"{user.first_name} {user.last_name}",
                description="NGO profile — please update your details.",
                status=NGOStatus.APPROVED,
            )
            logger.info(f"AccountService: auto-created approved NGO profile for {user.email}")

        AuditLog.objects.create(
            user=user,
            action=AuditAction.REGISTER,
            new_values={'email': user.email, 'role': user.role},
        )

        logger.info(f"AccountService: registered user {user.email} with role {user.role}")
        return user
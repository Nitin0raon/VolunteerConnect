"""
Business logic for NGO profile management and approval workflow.
"""
import logging
from django.db import transaction
from django.utils import timezone

from apps.ngos.models import NGOStatus
from apps.audit.models import AuditAction
from repositories.ngo_repository import NGORepository
from services.email_service import EmailService
from services.activity_service import ActivityService
from services.audit_service import AuditService
from utils.exceptions import ResourceNotFoundException, ConflictException, PermissionDeniedException
from apps.activity.models import ActivityAction

logger = logging.getLogger('services')


class NGOService:
    """Service layer for all NGO-related business logic."""

    @staticmethod
    def create_profile(user, validated_data: dict):
        """Create an NGO profile (always starts as pending)."""
        existing = NGORepository.get_by_user(user)
        if existing:
            raise ConflictException('NGO profile already exists for this user.')

        profile = NGORepository.create(user=user, **validated_data, status=NGOStatus.PENDING)
        logger.info(f"NGOService: created profile for {user.email} (pending approval)")
        return profile

    @staticmethod
    def update_profile(user, validated_data: dict):
        profile = NGORepository.get_by_user(user)
        if not profile:
            raise ResourceNotFoundException('NGO profile not found.')
        return NGORepository.update(profile, **validated_data)

    @staticmethod
    def get_profile_by_user(user):
        profile = NGORepository.get_by_user(user)
        if not profile:
            raise ResourceNotFoundException('NGO profile not found.')
        return profile

    @staticmethod
    def get_ngo_by_id(ngo_id: int):
        profile = NGORepository.get_by_id(ngo_id)
        if not profile:
            raise ResourceNotFoundException('NGO not found.')
        return profile

    @staticmethod
    def get_pending_ngos():
        return NGORepository.get_pending()

    @staticmethod
    def get_approved_ngos():
        return NGORepository.get_approved()

    @staticmethod
    @transaction.atomic
    def approve_ngo(ngo_id: int, approved_by):
        profile = NGORepository.get_by_id(ngo_id)
        if not profile:
            raise ResourceNotFoundException('NGO not found.')
        if profile.status == NGOStatus.APPROVED:
            raise ConflictException('NGO is already approved.')

        old_status = profile.status
        profile = NGORepository.update(
            profile,
            status=NGOStatus.APPROVED,
            approved_by=approved_by,
            approved_at=timezone.now(),
            rejection_reason='',
        )

        ActivityService.log(
            user=profile.user,
            action=ActivityAction.NGO_APPROVED,
            description=f'Your NGO "{profile.organization_name}" was approved.',
        )
        AuditService.log(
            user=approved_by,
            action=AuditAction.NGO_APPROVED,
            old_values={'status': old_status},
            new_values={'status': NGOStatus.APPROVED, 'ngo_id': profile.id},
        )

        EmailService.send_ngo_approved(profile)
        logger.info(f"NGOService: NGO {profile.id} approved by {approved_by.email}")
        return profile

    @staticmethod
    @transaction.atomic
    def reject_ngo(ngo_id: int, reason: str, rejected_by):
        profile = NGORepository.get_by_id(ngo_id)
        if not profile:
            raise ResourceNotFoundException('NGO not found.')
        if profile.status == NGOStatus.APPROVED:
            raise ConflictException('Cannot reject an already-approved NGO.')

        old_status = profile.status
        profile = NGORepository.update(
            profile,
            status=NGOStatus.REJECTED,
            rejection_reason=reason,
        )

        ActivityService.log(
            user=profile.user,
            action=ActivityAction.NGO_REJECTED,
            description=f'Your NGO "{profile.organization_name}" application was rejected.',
            metadata={'reason': reason},
        )
        AuditService.log(
            user=rejected_by,
            action=AuditAction.NGO_REJECTED,
            old_values={'status': old_status},
            new_values={'status': NGOStatus.REJECTED, 'reason': reason, 'ngo_id': profile.id},
        )

        EmailService.send_ngo_rejected(profile, reason)
        logger.info(f"NGOService: NGO {profile.id} rejected by {rejected_by.email}")
        return profile

    @staticmethod
    def assert_approved(user):
        """Get the NGO profile and check if it is approved."""
        profile = NGORepository.get_by_user(user)
        if not profile:
            raise ResourceNotFoundException('NGO profile not found. Please complete your profile first.')
        if profile.status != NGOStatus.APPROVED:
            raise PermissionDeniedException('Your NGO profile must be approved to perform this action.')
        return profile

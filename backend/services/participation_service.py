"""
Business logic for volunteer participation with NGO approval.
"""
import logging
from django.db import transaction
from django.utils import timezone

from apps.participation.models import Participation, ParticipationStatus
from apps.audit.models import AuditAction
from apps.activity.models import ActivityAction
from repositories.program_repository import ProgramRepository
from repositories.participation_repository import ParticipationRepository
from services.email_service import EmailService
from services.activity_service import ActivityService
from services.audit_service import AuditService
from utils.exceptions import (
    ResourceNotFoundException, ConflictException,
    ServiceException, PermissionDeniedException,
)
from utils.cache import invalidate_ngo_dashboard, invalidate_volunteer_dashboard

logger = logging.getLogger('services')


class ParticipationService:

    @staticmethod
    @transaction.atomic
    def request_join(volunteer, program_id: int, message: str = ''):
        """Volunteer sends a join request — stays PENDING until NGO reviews it."""
        program = ProgramRepository.get_by_id_for_update(program_id)
        if not program:
            raise ResourceNotFoundException('Program not found.')

        from apps.programs.models import ProgramStatus
        if program.status != ProgramStatus.ACTIVE:
            raise ServiceException('Cannot join a program that is not active.')

        # Check for any existing active request
        existing = Participation.objects.filter(
            volunteer=volunteer,
            program=program,
            status__in=[
                ParticipationStatus.PENDING,
                ParticipationStatus.JOINED,
                ParticipationStatus.WAITLISTED,
            ]
        ).first()

        if existing:
            status_messages = {
                ParticipationStatus.PENDING: 'You already have a pending request for this program.',
                ParticipationStatus.JOINED: 'You are already a participant in this program.',
                ParticipationStatus.WAITLISTED: 'You are already on the waitlist for this program.',
            }
            raise ConflictException(status_messages.get(existing.status, 'Already enrolled.'))

        participation = Participation.objects.create(
            volunteer=volunteer,
            program=program,
            status=ParticipationStatus.PENDING,
            message=message,
        )

        ActivityService.log(
            user=volunteer,
            action=ActivityAction.VOLUNTEER_JOINED,
            description=f'You requested to join "{program.title}". Waiting for NGO approval.',
            metadata={'program_id': program.id},
        )

        # Notify NGO
        ActivityService.log(
            user=program.ngo.user,
            action=ActivityAction.VOLUNTEER_JOINED,
            description=f'{volunteer.get_full_name()} requested to join "{program.title}".',
            metadata={'program_id': program.id, 'volunteer_id': volunteer.id},
        )

        invalidate_volunteer_dashboard(volunteer.id)
        invalidate_ngo_dashboard(program.ngo_id)

        logger.info(f"ParticipationService: volunteer {volunteer.email} requested to join program {program_id}")
        return participation

    @staticmethod
    @transaction.atomic
    def review_request(participation_id: int, ngo_user, action: str, reason: str = ''):
        """NGO accepts or rejects a pending join request."""
        try:
            participation = Participation.objects.select_related(
                'volunteer', 'program', 'program__ngo', 'program__ngo__user'
            ).select_for_update().get(id=participation_id)
        except Participation.DoesNotExist:
            raise ResourceNotFoundException('Join request not found.')

        # Verify this NGO owns the program
        ngo_profile = getattr(ngo_user, 'ngo_profile', None)
        if not ngo_profile or participation.program.ngo_id != ngo_profile.id:
            raise PermissionDeniedException('You do not own this program.')

        if participation.status != ParticipationStatus.PENDING:
            raise ConflictException(f'This request is already {participation.status}.')

        program = participation.program
        now = timezone.now()

        if action == 'accept':
            if program.is_full:
                # Put on waitlist instead
                from django.db.models import Max
                max_pos = Participation.objects.filter(
                    program=program, status=ParticipationStatus.WAITLISTED
                ).aggregate(Max('waitlist_position'))['waitlist_position__max'] or 0
                participation.status = ParticipationStatus.WAITLISTED
                participation.waitlist_position = max_pos + 1
                participation.reviewed_at = now
                participation.save()

                ActivityService.log(
                    user=participation.volunteer,
                    action=ActivityAction.VOLUNTEER_WAITLISTED,
                    description=f'Your request for "{program.title}" was accepted but the program is full. You\'ve been added to the waitlist.',
                    metadata={'program_id': program.id},
                )
                EmailService.send_volunteer_waitlisted(participation)
                logger.info(f"ParticipationService: {participation.volunteer.email} waitlisted for program {program.id}")
            else:
                participation.status = ParticipationStatus.JOINED
                participation.joined_at = now
                participation.reviewed_at = now
                participation.save()

                ProgramRepository.increment_participants(program)

                ActivityService.log(
                    user=participation.volunteer,
                    action=ActivityAction.VOLUNTEER_JOINED,
                    description=f'Your request to join "{program.title}" was accepted!',
                    metadata={'program_id': program.id},
                )
                EmailService.send_volunteer_joined(participation)
                logger.info(f"ParticipationService: {participation.volunteer.email} accepted into program {program.id}")

        elif action == 'reject':
            participation.status = ParticipationStatus.REJECTED
            participation.reviewed_at = now
            participation.save()

            ActivityService.log(
                user=participation.volunteer,
                action=ActivityAction.VOLUNTEER_LEFT,
                description=f'Your request to join "{program.title}" was not accepted.{" Reason: " + reason if reason else ""}',
                metadata={'program_id': program.id},
            )
            logger.info(f"ParticipationService: {participation.volunteer.email} rejected from program {program.id}")

        AuditService.log(
            user=ngo_user,
            action=AuditAction.PARTICIPATION_JOINED,
            new_values={
                'program_id': program.id,
                'volunteer_id': participation.volunteer_id,
                'action': action,
            },
        )

        invalidate_volunteer_dashboard(participation.volunteer_id)
        invalidate_ngo_dashboard(ngo_profile.id)

        return participation

    @staticmethod
    @transaction.atomic
    def leave_program(volunteer, program_id: int):
        """Volunteer leaves a program or cancels a pending request."""
        program = ProgramRepository.get_by_id_for_update(program_id)
        if not program:
            raise ResourceNotFoundException('Program not found.')

        participation = Participation.objects.filter(
            volunteer=volunteer,
            program=program,
            status__in=[
                ParticipationStatus.PENDING,
                ParticipationStatus.JOINED,
                ParticipationStatus.WAITLISTED,
            ]
        ).first()

        if not participation:
            raise ConflictException('You are not currently enrolled or pending in this program.')

        was_joined = participation.status == ParticipationStatus.JOINED

        participation.status = ParticipationStatus.LEFT
        participation.left_at = timezone.now()
        participation.save()

        if was_joined:
            ProgramRepository.decrement_participants(program)
            ParticipationService._promote_from_waitlist(program)

        ActivityService.log(
            user=volunteer,
            action=ActivityAction.VOLUNTEER_LEFT,
            description=f'You left "{program.title}".',
            metadata={'program_id': program.id},
        )
        EmailService.send_volunteer_left(volunteer, program)
        invalidate_volunteer_dashboard(volunteer.id)
        invalidate_ngo_dashboard(program.ngo_id)

        logger.info(f"ParticipationService: volunteer {volunteer.email} left program {program_id}")

    @staticmethod
    def _promote_from_waitlist(program) -> bool:
        """Promote first waitlisted volunteer to joined. Returns True if promoted, False otherwise."""
        next_in_line = ParticipationRepository.get_first_waitlisted(program)
        if not next_in_line:
            return False

        ParticipationRepository.update(
            next_in_line,
            status=ParticipationStatus.JOINED,
            waitlist_position=None,
            joined_at=timezone.now(),
        )
        ProgramRepository.increment_participants(program)

        ActivityService.log(
            user=next_in_line.volunteer,
            action=ActivityAction.WAITLIST_PROMOTED,
            description=f'You were promoted from the waitlist into "{program.title}".',
            metadata={'program_id': program.id},
        )
        EmailService.send_waitlist_promoted(next_in_line)
        invalidate_volunteer_dashboard(next_in_line.volunteer_id)
        return True

    @staticmethod
    def get_volunteer_participations(volunteer):
        return Participation.objects.filter(volunteer=volunteer).select_related(
            'program', 'program__ngo'
        ).order_by('-requested_at')

    @staticmethod
    def get_pending_requests_for_ngo(ngo_user):
        """Get all pending join requests for programs owned by this NGO."""
        ngo_profile = getattr(ngo_user, 'ngo_profile', None)
        if not ngo_profile:
            raise ResourceNotFoundException('NGO profile not found.')
        return Participation.objects.filter(
            program__ngo=ngo_profile,
            status=ParticipationStatus.PENDING,
        ).select_related('volunteer', 'program').order_by('requested_at')

    @staticmethod
    def get_all_requests_for_ngo(ngo_user):
        """Get all join requests for programs owned by this NGO."""
        ngo_profile = getattr(ngo_user, 'ngo_profile', None)
        if not ngo_profile:
            raise ResourceNotFoundException('NGO profile not found.')
        return Participation.objects.filter(
            program__ngo=ngo_profile,
        ).select_related('volunteer', 'program').order_by('-requested_at')
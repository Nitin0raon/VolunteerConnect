"""
Business logic for Program CRUD.
"""
import logging
from django.db import transaction

from apps.audit.models import AuditAction
from apps.activity.models import ActivityAction
from repositories.program_repository import ProgramRepository
from repositories.participation_repository import ParticipationRepository
from services.ngo_service import NGOService
from services.activity_service import ActivityService
from services.audit_service import AuditService
from utils.exceptions import ResourceNotFoundException, PermissionDeniedException, ServiceException
from utils.cache import invalidate_ngo_dashboard

logger = logging.getLogger('services')


class ProgramService:
    """Service layer for all program business logic."""

    @staticmethod
    def get_all_programs():
        return ProgramRepository.get_all()

    @staticmethod
    def get_program_by_id(program_id: int):
        program = ProgramRepository.get_by_id(program_id)
        if not program:
            raise ResourceNotFoundException('Program not found.')
        return program

    @staticmethod
    def get_programs_by_ngo_user(user):
        ngo_profile = NGOService.assert_approved(user)
        return ProgramRepository.get_by_ngo(ngo_profile)

    @staticmethod
    @transaction.atomic
    def create_program(user, validated_data: dict):
        ngo_profile = NGOService.assert_approved(user)

        program = ProgramRepository.create(ngo_profile=ngo_profile, **validated_data)

        ActivityService.log(
            user=user,
            action=ActivityAction.PROGRAM_CREATED,
            description=f'You created the program "{program.title}".',
            metadata={'program_id': program.id, 'title': program.title},
        )
        AuditService.log(
            user=user,
            action=AuditAction.PROGRAM_CREATED,
            new_values={'program_id': program.id, 'title': program.title, 'capacity': program.capacity},
        )
        invalidate_ngo_dashboard(ngo_profile.id)

        logger.info(f"ProgramService: program {program.id} created by NGO {user.email}")
        return program

    @staticmethod
    @transaction.atomic
    def update_program(program_id: int, user, validated_data: dict):
        program = ProgramRepository.get_by_id_for_update(program_id)
        if not program:
            raise ResourceNotFoundException('Program not found.')

        ngo_profile = NGOService.assert_approved(user)
        if program.ngo_id != ngo_profile.id:
            raise PermissionDeniedException('You do not own this program.')

        new_capacity = validated_data.get('capacity')
        if new_capacity is not None and new_capacity < program.current_participants:
            raise ServiceException(
                f'Cannot reduce capacity below current participant count ({program.current_participants}).'
            )

        old_values = {
            'title': program.title,
            'capacity': program.capacity,
            'status': program.status,
        }
        program = ProgramRepository.update(program, **validated_data)

        # Promote waitlisted volunteers if capacity was increased
        if new_capacity is not None and new_capacity > old_values['capacity']:
            from services.participation_service import ParticipationService
            program.refresh_from_db()
            while program.current_participants < program.capacity:
                if not ParticipationService._promote_from_waitlist(program):
                    break
                program.refresh_from_db()

        ActivityService.log(
            user=user,
            action=ActivityAction.PROGRAM_UPDATED,
            description=f'You updated the program "{program.title}".',
            metadata={'program_id': program.id},
        )
        AuditService.log(
            user=user,
            action=AuditAction.PROGRAM_UPDATED,
            old_values=old_values,
            new_values={k: str(v) for k, v in validated_data.items()},
        )
        invalidate_ngo_dashboard(ngo_profile.id)

        logger.info(f"ProgramService: program {program.id} updated by {user.email}")
        return program

    @staticmethod
    @transaction.atomic
    def delete_program(program_id: int, user):
        program = ProgramRepository.get_by_id(program_id)
        if not program:
            raise ResourceNotFoundException('Program not found.')

        ngo_profile = NGOService.assert_approved(user)
        if program.ngo_id != ngo_profile.id:
            raise PermissionDeniedException('You do not own this program.')

        if program.current_participants > 0:
            raise ServiceException('Cannot delete a program that still has participants.')

        title = program.title
        program_id_val = program.id

        ProgramRepository.delete(program)

        ActivityService.log(
            user=user,
            action=ActivityAction.PROGRAM_DELETED,
            description=f'You deleted the program "{title}".',
            metadata={'program_id': program_id_val},
        )
        AuditService.log(
            user=user,
            action=AuditAction.PROGRAM_DELETED,
            old_values={'program_id': program_id_val, 'title': title},
        )
        invalidate_ngo_dashboard(ngo_profile.id)

        logger.info(f"ProgramService: program {program_id_val} deleted by {user.email}")

    @staticmethod
    def get_program_participants(program_id: int, user):
        program = ProgramRepository.get_by_id(program_id)
        if not program:
            raise ResourceNotFoundException('Program not found.')

        ngo_profile = getattr(user, 'ngo_profile', None)
        if not ngo_profile or program.ngo_id != ngo_profile.id:
            raise PermissionDeniedException('You do not own this program.')

        return ParticipationRepository.get_by_program(program)

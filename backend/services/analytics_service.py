"""
Business logic for analytics dashboards with Redis caching.
"""
import logging
from django.db.models import Count, Q

from apps.programs.models import Program, ProgramStatus
from apps.participation.models import Participation, ParticipationStatus
from apps.certificates.models import Certificate
from repositories.ngo_repository import NGORepository
from utils.cache import (
    get_or_set,
    ngo_dashboard_key,
    volunteer_dashboard_key,
    CACHE_TIMEOUT_DASHBOARD,
)
from utils.exceptions import ResourceNotFoundException, PermissionDeniedException

logger = logging.getLogger('services')


class AnalyticsService:

    @staticmethod
    def get_ngo_dashboard(user) -> dict:
        ngo_profile = NGORepository.get_by_user(user)
        if not ngo_profile:
            raise ResourceNotFoundException('NGO profile not found.')
        if not ngo_profile.is_approved:
            raise PermissionDeniedException('NGO is not yet approved.')

        cache_key = ngo_dashboard_key(ngo_profile.id)

        def compute():
            programs = Program.objects.filter(ngo=ngo_profile)
            total = programs.count()
            active = programs.filter(status=ProgramStatus.ACTIVE).count()
            completed = programs.filter(status=ProgramStatus.COMPLETED).count()
            cancelled = programs.filter(status=ProgramStatus.CANCELLED).count()
            total_participants = programs.aggregate(
                total=Count('participations', filter=Q(participations__status=ParticipationStatus.JOINED))
            )['total'] or 0

            participants_per_program = list(
                programs.annotate(
                    joined_count=Count(
                        'participations',
                        filter=Q(participations__status=ParticipationStatus.JOINED)
                    )
                ).values('id', 'title', 'joined_count', 'status', 'capacity')
            )

            return {
                'total_programs': total,
                'active_programs': active,
                'completed_programs': completed,
                'cancelled_programs': cancelled,
                'total_participants': total_participants,
                'participants_per_program': participants_per_program,
            }

        return get_or_set(cache_key, compute, CACHE_TIMEOUT_DASHBOARD)

    @staticmethod
    def get_volunteer_dashboard(user) -> dict:
        cache_key = volunteer_dashboard_key(user.id)

        def compute():
            participations = Participation.objects.filter(volunteer=user)
            joined = participations.filter(status=ParticipationStatus.JOINED).count()
            waitlisted = participations.filter(status=ParticipationStatus.WAITLISTED).count()
            completed = participations.filter(status=ParticipationStatus.COMPLETED).count()
            left = participations.filter(status=ParticipationStatus.LEFT).count()

            active_program_ids = participations.filter(
                status=ParticipationStatus.JOINED
            ).values_list('program_id', flat=True)
            active_programs = Program.objects.filter(
                id__in=active_program_ids, status=ProgramStatus.ACTIVE
            ).count()

            certificates_earned = Certificate.objects.filter(volunteer=user).count()

            return {
                'joined_programs': joined,
                'waitlisted_programs': waitlisted,
                'completed_programs': completed,
                'left_programs': left,
                'active_programs': active_programs,
                'certificates_earned': certificates_earned,
            }

        return get_or_set(cache_key, compute, CACHE_TIMEOUT_DASHBOARD)

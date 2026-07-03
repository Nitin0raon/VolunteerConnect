"""
Repository for Participation data access.
"""
from apps.participation.models import Participation, ParticipationStatus


class ParticipationRepository:
    """Encapsulates all database queries for Participation."""

    @staticmethod
    def get_by_id(participation_id: int) -> Participation | None:
        return Participation.objects.select_related('volunteer', 'program').filter(id=participation_id).first()

    @staticmethod
    def get_active(volunteer, program) -> Participation | None:
        return Participation.objects.filter(
            volunteer=volunteer, program=program,
            status__in=[ParticipationStatus.JOINED, ParticipationStatus.WAITLISTED],
        ).first()

    @staticmethod
    def get_by_volunteer(volunteer) -> 'QuerySet[Participation]':
        return Participation.objects.select_related('program', 'program__ngo').filter(
            volunteer=volunteer
        ).order_by('-joined_at')

    @staticmethod
    def get_by_program(program) -> 'QuerySet[Participation]':
        return Participation.objects.select_related('volunteer').filter(
            program=program, status=ParticipationStatus.JOINED
        ).order_by('joined_at')

    @staticmethod
    def get_first_waitlisted(program) -> Participation | None:
        return Participation.objects.select_related('volunteer').filter(
            program=program, status=ParticipationStatus.WAITLISTED
        ).order_by('waitlist_position').first()

    @staticmethod
    def get_waitlist_count(program) -> int:
        return Participation.objects.filter(program=program, status=ParticipationStatus.WAITLISTED).count()

    @staticmethod
    def create(volunteer, program, status, waitlist_position=None) -> Participation:
        return Participation.objects.create(
            volunteer=volunteer, program=program, status=status, waitlist_position=waitlist_position,
        )

    @staticmethod
    def update(participation: Participation, **kwargs) -> Participation:
        for key, value in kwargs.items():
            setattr(participation, key, value)
        participation.save()
        return participation

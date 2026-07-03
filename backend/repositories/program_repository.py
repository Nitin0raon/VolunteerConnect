"""
Repository for Program data access.
"""
from apps.programs.models import Program


class ProgramRepository:
    """Encapsulates all database queries for Program."""

    @staticmethod
    def get_by_id(program_id: int) -> Program | None:
        return Program.objects.select_related('ngo', 'ngo__user').filter(id=program_id).first()

    @staticmethod
    def get_by_id_for_update(program_id: int) -> Program | None:
        """Used inside transactions to lock the row and prevent race conditions."""
        return Program.objects.select_for_update().select_related('ngo').filter(id=program_id).first()

    @staticmethod
    def get_all() -> 'QuerySet[Program]':
        return Program.objects.select_related('ngo', 'ngo__user').all()

    @staticmethod
    def get_by_ngo(ngo_profile) -> 'QuerySet[Program]':
        return Program.objects.select_related('ngo').filter(ngo=ngo_profile).order_by('-created_at')

    @staticmethod
    def create(ngo_profile, **kwargs) -> Program:
        return Program.objects.create(ngo=ngo_profile, **kwargs)

    @staticmethod
    def update(program: Program, **kwargs) -> Program:
        for key, value in kwargs.items():
            setattr(program, key, value)
        program.full_clean()
        program.save()
        return program

    @staticmethod
    def delete(program: Program) -> None:
        program.delete()

    @staticmethod
    def increment_participants(program: Program, amount: int = 1) -> Program:
        program.current_participants += amount
        program.save(update_fields=['current_participants', 'updated_at'])
        return program

    @staticmethod
    def decrement_participants(program: Program, amount: int = 1) -> Program:
        program.current_participants = max(0, program.current_participants - amount)
        program.save(update_fields=['current_participants', 'updated_at'])
        return program

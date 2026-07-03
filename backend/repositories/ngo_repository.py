"""
Repository for NGO profile data access.
"""
from apps.ngos.models import NGOProfile, NGOStatus


class NGORepository:
    """Encapsulates all database queries for NGOProfile."""

    @staticmethod
    def get_by_id(ngo_id: int) -> NGOProfile | None:
        return NGOProfile.objects.select_related('user').filter(id=ngo_id).first()

    @staticmethod
    def get_by_user(user) -> NGOProfile | None:
        return NGOProfile.objects.select_related('user').filter(user=user).first()

    @staticmethod
    def get_pending() -> 'QuerySet[NGOProfile]':
        return NGOProfile.objects.select_related('user').filter(status=NGOStatus.PENDING).order_by('created_at')

    @staticmethod
    def get_approved() -> 'QuerySet[NGOProfile]':
        return NGOProfile.objects.select_related('user').filter(status=NGOStatus.APPROVED).order_by('-created_at')

    @staticmethod
    def create(user, **kwargs) -> NGOProfile:
        return NGOProfile.objects.create(user=user, **kwargs)

    @staticmethod
    def update(profile: NGOProfile, **kwargs) -> NGOProfile:
        for key, value in kwargs.items():
            setattr(profile, key, value)
        profile.save()
        return profile

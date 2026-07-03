"""
Custom role-based DRF permission classes.
"""
from rest_framework.permissions import BasePermission


class IsNGO(BasePermission):
    """Allows access only to users with role=ngo."""

    message = 'Only NGO accounts can perform this action.'

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_ngo)


class IsVolunteer(BasePermission):
    """Allows access only to users with role=volunteer."""

    message = 'Only Volunteer accounts can perform this action.'

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_volunteer)


class IsAdmin(BasePermission):
    """Allows access only to admin/staff users."""

    message = 'Only Admin accounts can perform this action.'

    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated
            and (request.user.is_admin_user or request.user.is_staff)
        )


class IsApprovedNGO(BasePermission):
    """Allows access only to NGOs whose profile has been approved."""

    message = 'Your NGO account is not yet approved by the admin.'

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated and request.user.is_ngo):
            return False
        profile = getattr(request.user, 'ngo_profile', None)
        return bool(profile and profile.is_approved)


class IsOwnerNGO(BasePermission):
    """Object-level permission: only the NGO that owns the object may modify it."""

    message = 'You do not own this resource.'

    def has_object_permission(self, request, view, obj):
        ngo_profile = getattr(request.user, 'ngo_profile', None)
        owner = getattr(obj, 'ngo', None) or getattr(obj, 'created_by', None)
        return bool(ngo_profile and owner_id_matches(ngo_profile, owner))


def owner_id_matches(ngo_profile, owner):
    if owner is None:
        return False
    return ngo_profile.id == getattr(owner, 'id', owner)

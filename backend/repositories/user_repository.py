"""
Repository for User data access.
"""
from apps.accounts.models import User


class UserRepository:
    """Encapsulates all database queries for the User model."""

    @staticmethod
    def get_by_id(user_id: int) -> User | None:
        return User.objects.filter(id=user_id).first()

    @staticmethod
    def get_by_email(email: str) -> User | None:
        return User.objects.filter(email=email).first()

    @staticmethod
    def exists_by_email(email: str) -> bool:
        return User.objects.filter(email=email).exists()

    @staticmethod
    def create(**kwargs) -> User:
        return User.objects.create_user(**kwargs)

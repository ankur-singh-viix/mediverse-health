"""
User repository.

Adds user-specific query methods on top of the generic
`BaseRepository`.
"""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User, UserRole
from app.repositories.base_repository import BaseRepository


class UserRepository(BaseRepository[User]):
    """Data access layer for the `User` model."""

    def __init__(self, db: Session) -> None:
        super().__init__(User, db)

    def get_by_email(self, email: str) -> User | None:
        """Fetch a user by their (unique) email address."""
        statement = select(User).where(User.email == email)
        return self.db.execute(statement).scalar_one_or_none()

    def email_exists(self, email: str) -> bool:
        """Check whether an account with the given email already exists."""
        return self.get_by_email(email) is not None

    def list_by_role(self, role: UserRole) -> list[User]:
        """Return all users with the given role, most recently created first."""
        statement = select(User).where(User.role == role).order_by(User.created_at.desc())
        return list(self.db.execute(statement).scalars().all())
"""
User model.

This is the foundational identity entity that the authentication module
structure depends on. Only the schema/structure is defined here — no
authentication logic (hashing, token issuance, etc.) is implemented in
Phase 0.
"""

import enum

from sqlalchemy import Boolean, Enum, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.base_model import BaseModelMixin


class UserRole(str, enum.Enum):
    """Supported platform roles."""

    PATIENT = "patient"
    DOCTOR = "doctor"


class User(BaseModelMixin, Base):
    """Represents a registered platform user (patient or doctor)."""

    __tablename__ = "users"

    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role"),
        nullable=False,
        default=UserRole.PATIENT,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    def __repr__(self) -> str:  # pragma: no cover
        return f"<User id={self.id} email={self.email} role={self.role}>"

"""
User schemas.

Request/response contracts for user data. `UserResponse` is the safe,
public-facing representation returned by the API - it never includes
`hashed_password`.
"""

from pydantic import BaseModel, ConfigDict, EmailStr

from app.models.user import UserRole
from app.schemas.common import TimestampSchema


class UserBase(BaseModel):
    """Fields common to user creation and representation."""

    full_name: str
    email: EmailStr
    role: UserRole


class UserResponse(UserBase, TimestampSchema):
    """Public representation of a user, safe to return from the API."""

    model_config = ConfigDict(from_attributes=True)

    is_active: bool
    is_verified: bool

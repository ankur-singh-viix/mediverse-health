"""
Auth schemas.

Request/response contracts for registration, login, and token
issuance/refresh.
"""

from pydantic import BaseModel, EmailStr, Field

from app.models.user import UserRole
from app.schemas.user import UserResponse


class RegisterRequest(BaseModel):
    """Payload for creating a new patient or doctor account."""

    full_name: str = Field(min_length=2, max_length=255)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: UserRole


class LoginRequest(BaseModel):
    """Payload for authenticating with email + password."""

    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class RefreshRequest(BaseModel):
    """Payload for exchanging a refresh token for a new access token."""

    refresh_token: str


class TokenResponse(BaseModel):
    """Access/refresh token pair returned after successful auth."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class AuthResponse(TokenResponse):
    """Token pair bundled with the authenticated user's profile."""

    user: UserResponse

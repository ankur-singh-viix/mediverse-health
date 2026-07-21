"""
Auth service.

Owns the business logic for registration, login, and token refresh.
Routers depend on this service only - never on the repository or
password/JWT internals directly, keeping the API layer thin.
"""

import uuid

from sqlalchemy.orm import Session

from app.auth.jwt_handler import JWTHandler, TokenType
from app.core.security import hash_password, verify_password
from app.exceptions.custom_exceptions import (
    InvalidCredentialsException,
    UnauthorizedException,
    UserAlreadyExistsException,
)
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest, TokenResponse


class AuthService:
    """Business logic for authentication and account creation."""

    def __init__(self, db: Session) -> None:
        self.db = db
        self.user_repository = UserRepository(db)

    def register(self, payload: RegisterRequest) -> AuthResponse:
        """Create a new user account and issue an initial token pair."""
        if self.user_repository.email_exists(payload.email):
            raise UserAlreadyExistsException()

        user = User(
            full_name=payload.full_name,
            email=payload.email,
            hashed_password=hash_password(payload.password),
            role=payload.role,
        )
        user = self.user_repository.create(user)

        tokens = self._issue_tokens(user)
        return AuthResponse(**tokens.model_dump(), user=user)

    def login(self, payload: LoginRequest) -> AuthResponse:
        """Authenticate a user by email/password and issue a token pair."""
        user = self.user_repository.get_by_email(payload.email)

        if user is None or not verify_password(payload.password, user.hashed_password):
            raise InvalidCredentialsException()

        if not user.is_active:
            raise UnauthorizedException("This account has been deactivated.")

        tokens = self._issue_tokens(user)
        return AuthResponse(**tokens.model_dump(), user=user)

    def refresh_access_token(self, refresh_token: str) -> TokenResponse:
        """Exchange a valid refresh token for a new access/refresh pair."""
        payload = JWTHandler.decode_token(refresh_token, expected_type=TokenType.REFRESH)

        try:
            user_id = uuid.UUID(payload["sub"])
        except (KeyError, ValueError) as exc:
            raise UnauthorizedException("Invalid token subject.") from exc

        user = self.user_repository.get_by_id(user_id)

        if user is None or not user.is_active:
            raise UnauthorizedException("Account not found or inactive.")

        return self._issue_tokens(user)

    @staticmethod
    def _issue_tokens(user: User) -> TokenResponse:
        subject = str(user.id)
        return TokenResponse(
            access_token=JWTHandler.create_access_token(subject),
            refresh_token=JWTHandler.create_refresh_token(subject),
        )

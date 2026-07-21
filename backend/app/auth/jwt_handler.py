"""
JWT handler.

Encapsulates access/refresh token creation and decoding using
python-jose. This is the single place in the codebase that touches
JWT internals.
"""

import uuid
from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Any

from jose import JWTError, jwt

from app.core.config import settings
from app.exceptions.custom_exceptions import UnauthorizedException


class TokenType(str, Enum):
    ACCESS = "access"
    REFRESH = "refresh"


class JWTHandler:
    """Issues and validates JWT access/refresh tokens."""

    algorithm: str = settings.ALGORITHM
    secret_key: str = settings.SECRET_KEY
    access_token_expire_minutes: int = settings.ACCESS_TOKEN_EXPIRE_MINUTES
    refresh_token_expire_days: int = settings.REFRESH_TOKEN_EXPIRE_DAYS

    @classmethod
    def _create_token(cls, subject: str, token_type: TokenType, expires_delta: timedelta) -> str:
        now = datetime.now(timezone.utc)
        payload: dict[str, Any] = {
            "sub": subject,
            "type": token_type.value,
            "iat": now,
            "exp": now + expires_delta,
            "jti": str(uuid.uuid4()),
        }
        return jwt.encode(payload, cls.secret_key, algorithm=cls.algorithm)

    @classmethod
    def create_access_token(cls, subject: str) -> str:
        """Create a short-lived access token for the given subject (user id)."""
        return cls._create_token(
            subject,
            TokenType.ACCESS,
            timedelta(minutes=cls.access_token_expire_minutes),
        )

    @classmethod
    def create_refresh_token(cls, subject: str) -> str:
        """Create a long-lived refresh token for the given subject (user id)."""
        return cls._create_token(
            subject,
            TokenType.REFRESH,
            timedelta(days=cls.refresh_token_expire_days),
        )

    @classmethod
    def decode_token(cls, token: str, expected_type: TokenType) -> dict[str, Any]:
        """
        Decode and validate a JWT, ensuring it matches the expected token
        type. Raises `UnauthorizedException` on any validation failure.
        """
        try:
            payload = jwt.decode(token, cls.secret_key, algorithms=[cls.algorithm])
        except JWTError as exc:
            raise UnauthorizedException("Invalid or expired token") from exc

        if payload.get("type") != expected_type.value:
            raise UnauthorizedException("Invalid token type")

        return payload

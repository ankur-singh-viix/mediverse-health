"""
JWT handler (structure only).

Defines the interface for future JWT creation/validation logic.
No token issuance or verification is implemented in Phase 0.
"""

from app.core.config import settings


class JWTHandler:
    """
    Placeholder for JWT encode/decode operations.

    Future implementation will use `settings.SECRET_KEY` and
    `settings.ALGORITHM` together with `python-jose` to issue and
    validate access/refresh tokens.
    """

    algorithm: str = settings.ALGORITHM
    secret_key: str = settings.SECRET_KEY
    access_token_expire_minutes: int = settings.ACCESS_TOKEN_EXPIRE_MINUTES
    refresh_token_expire_days: int = settings.REFRESH_TOKEN_EXPIRE_DAYS

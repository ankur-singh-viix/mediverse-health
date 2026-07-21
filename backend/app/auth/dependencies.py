"""
Authentication & authorization dependencies.

FastAPI dependencies that extract and validate the current user from
a bearer token, and enforce role-based access control on protected
routes.
"""

import uuid

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.auth.jwt_handler import JWTHandler, TokenType
from app.db.session import get_db
from app.exceptions.custom_exceptions import UnauthorizedException, ForbiddenException
from app.models.user import User, UserRole
from app.repositories.user_repository import UserRepository

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Resolve the authenticated user from the `Authorization: Bearer <token>`
    header. Raises `UnauthorizedException` if the token is missing,
    invalid, expired, or the user no longer exists/is inactive.
    """
    if credentials is None:
        raise UnauthorizedException("Missing authentication credentials.")

    payload = JWTHandler.decode_token(credentials.credentials, expected_type=TokenType.ACCESS)

    try:
        user_id = uuid.UUID(payload["sub"])
    except (KeyError, ValueError) as exc:
        raise UnauthorizedException("Invalid token subject.") from exc

    user = UserRepository(db).get_by_id(user_id)

    if user is None or not user.is_active:
        raise UnauthorizedException("Account not found or inactive.")

    return user


def require_role(*allowed_roles: UserRole):
    """
    Dependency factory that restricts a route to specific user roles.

    Usage:
        @router.get("/doctor-only", dependencies=[Depends(require_role(UserRole.DOCTOR))])
    """

    def _dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise ForbiddenException("You do not have permission to access this resource.")
        return current_user

    return _dependency

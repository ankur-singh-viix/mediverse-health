"""
Custom application exceptions.

Using domain-specific exceptions (instead of raising HTTPException
deep inside services/repositories) keeps business logic decoupled from
the web framework, per Clean Architecture principles.
"""


class AppException(Exception):
    """Base class for all application-specific exceptions."""

    status_code: int = 500
    error: str = "internal_server_error"

    def __init__(self, detail: str | None = None) -> None:
        self.detail = detail or "An unexpected error occurred."
        super().__init__(self.detail)


class NotFoundException(AppException):
    """Raised when a requested resource does not exist."""

    status_code = 404
    error = "not_found"


class BadRequestException(AppException):
    """Raised when the client request is malformed or invalid."""

    status_code = 400
    error = "bad_request"


class UnauthorizedException(AppException):
    """Raised when authentication is missing or invalid."""

    status_code = 401
    error = "unauthorized"


class ForbiddenException(AppException):
    """Raised when the authenticated user lacks required permissions."""

    status_code = 403
    error = "forbidden"


class ConflictException(AppException):
    """Raised when a request conflicts with the current state of a resource."""

    status_code = 409
    error = "conflict"

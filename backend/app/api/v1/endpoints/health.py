"""
Health check endpoint.

Used by load balancers, container orchestrators, and uptime monitors
to verify the service is running.
"""

from fastapi import APIRouter

from app.core.config import settings
from app.schemas.common import HealthCheckResponse

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthCheckResponse,
    summary="Health check",
    description="Returns the current health status of the API.",
)
def health_check() -> HealthCheckResponse:
    """Simple liveness/readiness probe."""
    return HealthCheckResponse(
        status="ok",
        app_name=settings.APP_NAME,
        version=settings.VERSION,
        environment=settings.APP_ENV,
    )

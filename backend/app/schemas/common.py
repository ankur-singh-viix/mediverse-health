"""
Common/shared Pydantic schemas reused across feature schemas.
"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ORMBaseSchema(BaseModel):
    """Base schema for models read from the ORM."""

    model_config = ConfigDict(from_attributes=True)


class TimestampSchema(BaseModel):
    """Adds standard timestamp fields to a schema."""

    id: UUID
    created_at: datetime
    updated_at: datetime


class HealthCheckResponse(BaseModel):
    """Response schema for the health check endpoint."""

    status: str
    app_name: str
    version: str
    environment: str


class MessageResponse(BaseModel):
    """Generic message response schema."""

    message: str


class ErrorResponse(BaseModel):
    """Standard error response schema returned by exception handlers."""

    success: bool = False
    error: str
    detail: str | None = None
    status_code: int

"""
Appointment feature schemas.

Request/response contracts for the appointment booking workflow, used
by both patients (create/view/cancel) and doctors (view/respond).
"""

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.appointment import AppointmentStatus


class DoctorOptionResponse(BaseModel):
    """A doctor a patient can select when requesting an appointment."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    full_name: str
    email: EmailStr


class AppointmentCreateRequest(BaseModel):
    """Payload for a patient requesting a new appointment."""

    doctor_id: UUID
    requested_at: datetime
    reason: str | None = Field(default=None, max_length=1000)


class AppointmentRespondRequest(BaseModel):
    """Payload for a doctor accepting or declining a pending appointment."""

    status: Literal["confirmed", "declined"]


class AppointmentResponse(BaseModel):
    """A single appointment, with both parties' names for display."""

    id: UUID
    patient_id: UUID
    patient_full_name: str
    doctor_id: UUID
    doctor_full_name: str
    requested_at: datetime
    reason: str | None
    status: AppointmentStatus
    created_at: datetime
"""
Patient feature schemas.

Request/response contracts for the patient profile and medical
records endpoints.
"""

from datetime import date
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.patient_profile import Gender
from app.schemas.common import TimestampSchema, ORMBaseSchema


class PatientProfileResponse(ORMBaseSchema, TimestampSchema):
    """Public representation of a patient's profile."""

    user_id: UUID
    date_of_birth: date | None = None
    gender: Gender | None = None
    blood_group: str | None = None
    phone_number: str | None = None
    address: str | None = None
    emergency_contact_name: str | None = None
    emergency_contact_phone: str | None = None


class PatientProfileUpdateRequest(BaseModel):
    """Payload for creating/updating a patient's profile. All fields optional."""

    date_of_birth: date | None = None
    gender: Gender | None = None
    blood_group: str | None = Field(default=None, max_length=10)
    phone_number: str | None = Field(default=None, max_length=30)
    address: str | None = Field(default=None, max_length=500)
    emergency_contact_name: str | None = Field(default=None, max_length=255)
    emergency_contact_phone: str | None = Field(default=None, max_length=30)


class MedicalRecordCreateRequest(BaseModel):
    """Payload for creating a new medical record entry."""

    title: str = Field(min_length=2, max_length=255)
    description: str | None = Field(default=None, max_length=5000)
    record_date: date | None = None


class MedicalRecordResponse(ORMBaseSchema, TimestampSchema):
    """Public representation of a medical record entry."""

    title: str
    description: str | None = None
    record_date: date
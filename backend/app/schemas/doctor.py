"""
Doctor feature schemas.

Read-only views a doctor sees of a patient: a lightweight summary for
list views, and a full detail view combining identity, profile, and
medical records.
"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr

from app.schemas.patient import MedicalRecordResponse, PatientProfileResponse
from app.schemas.user import UserResponse


class PatientSummaryResponse(BaseModel):
    """Lightweight patient representation for the doctor's patient list."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    full_name: str
    email: EmailStr
    is_active: bool
    created_at: datetime


class PatientDetailResponse(BaseModel):
    """Full read-only view of a single patient for a doctor."""

    user: UserResponse
    profile: PatientProfileResponse
    records: list[MedicalRecordResponse]
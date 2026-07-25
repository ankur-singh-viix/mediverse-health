"""
Doctor feature schemas.

Read-only views a doctor sees of a patient: a lightweight summary for
list views, and a full detail view combining identity, profile, and
medical records.
"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.schemas.patient import MedicalRecordResponse, PatientProfileResponse
from app.schemas.prediction import PredictionResponse
from app.schemas.user import UserResponse


class PatientSummaryResponse(BaseModel):
    """Lightweight patient representation for the doctor's patient list."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    full_name: str
    email: EmailStr
    is_active: bool
    created_at: datetime


class DoctorNoteCreateRequest(BaseModel):
    """Payload for a doctor adding a clinical note about a patient."""

    note: str = Field(min_length=2, max_length=3000)


class DoctorNoteResponse(BaseModel):
    """A single clinical note, including the authoring doctor's name."""

    id: UUID
    doctor_id: UUID
    doctor_full_name: str
    note: str
    created_at: datetime


class PatientDetailResponse(BaseModel):
    """Full read-only view of a single patient for a doctor, plus their own clinical notes."""

    user: UserResponse
    profile: PatientProfileResponse
    records: list[MedicalRecordResponse]
    predictions: list[PredictionResponse]
    notes: list[DoctorNoteResponse]
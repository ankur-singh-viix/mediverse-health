"""
Doctor endpoints.

Lets an authenticated doctor browse the patient roster, inspect a
patient's profile/medical records/AI symptom-check history (all
read-only), and add their own clinical notes about a patient.
"""

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.auth.dependencies import require_role
from app.db.session import get_db
from app.models.user import User, UserRole
from app.schemas.doctor import (
    DoctorNoteCreateRequest,
    DoctorNoteResponse,
    PatientDetailResponse,
    PatientSummaryResponse,
)
from app.services.doctor_service import DoctorService

router = APIRouter()


@router.get(
    "/patients",
    response_model=list[PatientSummaryResponse],
    summary="List all patients",
)
def list_patients(
    current_user: User = Depends(require_role(UserRole.DOCTOR)),
    db: Session = Depends(get_db),
) -> list[PatientSummaryResponse]:
    return DoctorService(db).list_patients()


@router.get(
    "/patients/{patient_id}",
    response_model=PatientDetailResponse,
    summary="Get a patient's profile, medical records, AI history, and notes",
)
def get_patient_detail(
    patient_id: uuid.UUID,
    current_user: User = Depends(require_role(UserRole.DOCTOR)),
    db: Session = Depends(get_db),
) -> PatientDetailResponse:
    return DoctorService(db).get_patient_detail(patient_id)


@router.post(
    "/patients/{patient_id}/notes",
    response_model=DoctorNoteResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a clinical note about a patient",
)
def add_patient_note(
    patient_id: uuid.UUID,
    payload: DoctorNoteCreateRequest,
    current_user: User = Depends(require_role(UserRole.DOCTOR)),
    db: Session = Depends(get_db),
) -> DoctorNoteResponse:
    note = DoctorService(db).add_note(current_user.id, patient_id, payload.note)
    return DoctorNoteResponse(
        id=note.id,
        doctor_id=note.doctor_id,
        doctor_full_name=current_user.full_name,
        note=note.note,
        created_at=note.created_at,
    )
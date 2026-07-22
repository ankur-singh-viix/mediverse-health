"""
Doctor endpoints.

Read-only routes that let an authenticated doctor browse the patient
roster and inspect an individual patient's profile and medical
records. Doctors cannot modify patient data in this phase.
"""

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.dependencies import require_role
from app.db.session import get_db
from app.models.user import User, UserRole
from app.schemas.doctor import PatientDetailResponse, PatientSummaryResponse
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
    summary="Get a patient's profile and medical records",
)
def get_patient_detail(
    patient_id: uuid.UUID,
    current_user: User = Depends(require_role(UserRole.DOCTOR)),
    db: Session = Depends(get_db),
) -> PatientDetailResponse:
    return DoctorService(db).get_patient_detail(patient_id)
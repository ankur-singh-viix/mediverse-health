"""
Patient endpoints.

All routes are scoped to the currently authenticated patient
(`/patients/me/...`) and protected by role-based access control - a
patient can only ever see or modify their own data.
"""

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.auth.dependencies import require_role
from app.db.session import get_db
from app.models.user import User, UserRole
from app.schemas.patient import (
    MedicalRecordCreateRequest,
    MedicalRecordResponse,
    PatientProfileResponse,
    PatientProfileUpdateRequest,
)
from app.services.patient_service import PatientService

router = APIRouter()


@router.get("/me/profile", response_model=PatientProfileResponse, summary="Get my patient profile")
def get_my_profile(
    current_user: User = Depends(require_role(UserRole.PATIENT)),
    db: Session = Depends(get_db),
) -> PatientProfileResponse:
    return PatientService(db).get_or_create_profile(current_user.id)


@router.put("/me/profile", response_model=PatientProfileResponse, summary="Update my patient profile")
def update_my_profile(
    payload: PatientProfileUpdateRequest,
    current_user: User = Depends(require_role(UserRole.PATIENT)),
    db: Session = Depends(get_db),
) -> PatientProfileResponse:
    return PatientService(db).update_profile(current_user.id, payload)


@router.get(
    "/me/records",
    response_model=list[MedicalRecordResponse],
    summary="List my medical records",
)
def list_my_records(
    current_user: User = Depends(require_role(UserRole.PATIENT)),
    db: Session = Depends(get_db),
) -> list[MedicalRecordResponse]:
    return PatientService(db).list_records(current_user.id)


@router.post(
    "/me/records",
    response_model=MedicalRecordResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a new medical record",
)
def add_my_record(
    payload: MedicalRecordCreateRequest,
    current_user: User = Depends(require_role(UserRole.PATIENT)),
    db: Session = Depends(get_db),
) -> MedicalRecordResponse:
    return PatientService(db).add_record(current_user.id, payload)


@router.delete(
    "/me/records/{record_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a medical record",
)
def delete_my_record(
    record_id: uuid.UUID,
    current_user: User = Depends(require_role(UserRole.PATIENT)),
    db: Session = Depends(get_db),
) -> None:
    PatientService(db).delete_record(current_user.id, record_id)
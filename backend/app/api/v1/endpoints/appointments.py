"""
Appointment endpoints.

Patients request appointments and view/cancel their own. Doctors view
appointments requested with them and accept/decline pending ones.
"""

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.dependencies import require_role
from app.db.session import get_db
from app.models.user import User, UserRole
from app.schemas.appointment import (
    AppointmentCreateRequest,
    AppointmentRespondRequest,
    AppointmentResponse,
    DoctorOptionResponse,
)
from app.services.appointment_service import AppointmentService

router = APIRouter()


@router.get(
    "/doctors",
    response_model=list[DoctorOptionResponse],
    summary="List doctors available to book an appointment with",
)
def list_doctors(
    current_user: User = Depends(require_role(UserRole.PATIENT)),
    db: Session = Depends(get_db),
) -> list[DoctorOptionResponse]:
    return AppointmentService(db).list_available_doctors()


@router.post(
    "",
    response_model=AppointmentResponse,
    status_code=201,
    summary="Request a new appointment",
)
def create_appointment(
    payload: AppointmentCreateRequest,
    current_user: User = Depends(require_role(UserRole.PATIENT)),
    db: Session = Depends(get_db),
) -> AppointmentResponse:
    return AppointmentService(db).create_appointment(current_user.id, payload)


@router.get(
    "/me",
    response_model=list[AppointmentResponse],
    summary="List my appointments (patient)",
)
def list_my_appointments(
    current_user: User = Depends(require_role(UserRole.PATIENT)),
    db: Session = Depends(get_db),
) -> list[AppointmentResponse]:
    return AppointmentService(db).list_my_appointments_as_patient(current_user.id)


@router.patch(
    "/{appointment_id}/cancel",
    response_model=AppointmentResponse,
    summary="Cancel my own pending appointment (patient)",
)
def cancel_appointment(
    appointment_id: uuid.UUID,
    current_user: User = Depends(require_role(UserRole.PATIENT)),
    db: Session = Depends(get_db),
) -> AppointmentResponse:
    return AppointmentService(db).cancel_appointment(current_user.id, appointment_id)


@router.get(
    "/doctor/me",
    response_model=list[AppointmentResponse],
    summary="List appointments requested with me (doctor)",
)
def list_doctor_appointments(
    current_user: User = Depends(require_role(UserRole.DOCTOR)),
    db: Session = Depends(get_db),
) -> list[AppointmentResponse]:
    return AppointmentService(db).list_my_appointments_as_doctor(current_user.id)


@router.patch(
    "/{appointment_id}/respond",
    response_model=AppointmentResponse,
    summary="Accept or decline a pending appointment (doctor)",
)
def respond_to_appointment(
    appointment_id: uuid.UUID,
    payload: AppointmentRespondRequest,
    current_user: User = Depends(require_role(UserRole.DOCTOR)),
    db: Session = Depends(get_db),
) -> AppointmentResponse:
    return AppointmentService(db).respond_to_appointment(
        current_user.id, appointment_id, payload.status
    )
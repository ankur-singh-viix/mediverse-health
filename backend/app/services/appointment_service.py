"""
Appointment service.

Owns the appointment booking workflow: patients request appointments
with a doctor, doctors accept/decline pending requests, patients can
cancel their own pending requests. Status transitions are enforced
here so invalid state changes (e.g. responding to an already-resolved
appointment) are rejected consistently.
"""

import uuid

from sqlalchemy.orm import Session

from app.exceptions.custom_exceptions import BadRequestException, NotFoundException
from app.models.appointment import Appointment, AppointmentStatus
from app.models.user import User, UserRole
from app.repositories.appointment_repository import AppointmentRepository
from app.repositories.user_repository import UserRepository
from app.schemas.appointment import AppointmentCreateRequest, AppointmentResponse


class AppointmentService:
    """Business logic for the appointment booking workflow."""

    def __init__(self, db: Session) -> None:
        self.db = db
        self.appointment_repository = AppointmentRepository(db)
        self.user_repository = UserRepository(db)

    def list_available_doctors(self) -> list[User]:
        """Return every user with the 'doctor' role, for the booking form."""
        return self.user_repository.list_by_role(UserRole.DOCTOR)

    def _build_response(self, appointment: Appointment) -> AppointmentResponse:
        patient = self.user_repository.get_by_id(appointment.patient_id)
        doctor = self.user_repository.get_by_id(appointment.doctor_id)
        return AppointmentResponse(
            id=appointment.id,
            patient_id=appointment.patient_id,
            patient_full_name=patient.full_name if patient else "Unknown",
            doctor_id=appointment.doctor_id,
            doctor_full_name=doctor.full_name if doctor else "Unknown",
            requested_at=appointment.requested_at,
            reason=appointment.reason,
            status=appointment.status,
            created_at=appointment.created_at,
        )

    def create_appointment(
        self, patient_id: uuid.UUID, payload: AppointmentCreateRequest
    ) -> AppointmentResponse:
        """Create a new pending appointment request with the chosen doctor."""
        doctor = self.user_repository.get_by_id(payload.doctor_id)
        if doctor is None or doctor.role != UserRole.DOCTOR:
            raise NotFoundException("Doctor not found.")

        appointment = Appointment(
            patient_id=patient_id,
            doctor_id=payload.doctor_id,
            requested_at=payload.requested_at,
            reason=payload.reason,
            status=AppointmentStatus.PENDING,
        )
        appointment = self.appointment_repository.create(appointment)
        return self._build_response(appointment)

    def list_my_appointments_as_patient(self, patient_id: uuid.UUID) -> list[AppointmentResponse]:
        appointments = self.appointment_repository.list_by_patient(patient_id)
        return [self._build_response(a) for a in appointments]

    def list_my_appointments_as_doctor(self, doctor_id: uuid.UUID) -> list[AppointmentResponse]:
        appointments = self.appointment_repository.list_by_doctor(doctor_id)
        return [self._build_response(a) for a in appointments]

    def respond_to_appointment(
        self, doctor_id: uuid.UUID, appointment_id: uuid.UUID, new_status: str
    ) -> AppointmentResponse:
        """A doctor accepts or declines one of their own pending appointments."""
        appointment = self.appointment_repository.get_by_id(appointment_id)
        if appointment is None or appointment.doctor_id != doctor_id:
            raise NotFoundException("Appointment not found.")
        if appointment.status != AppointmentStatus.PENDING:
            raise BadRequestException("Only pending appointments can be responded to.")

        appointment.status = AppointmentStatus(new_status)
        appointment = self.appointment_repository.update(appointment)
        return self._build_response(appointment)

    def cancel_appointment(
        self, patient_id: uuid.UUID, appointment_id: uuid.UUID
    ) -> AppointmentResponse:
        """A patient cancels one of their own pending appointments."""
        appointment = self.appointment_repository.get_by_id(appointment_id)
        if appointment is None or appointment.patient_id != patient_id:
            raise NotFoundException("Appointment not found.")
        if appointment.status != AppointmentStatus.PENDING:
            raise BadRequestException("Only pending appointments can be cancelled.")

        appointment.status = AppointmentStatus.CANCELLED
        appointment = self.appointment_repository.update(appointment)
        return self._build_response(appointment)
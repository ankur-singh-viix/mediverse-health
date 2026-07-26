"""
Appointment repository.

Adds patient/doctor-scoped queries on top of the generic
`BaseRepository`.
"""

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.appointment import Appointment
from app.repositories.base_repository import BaseRepository


class AppointmentRepository(BaseRepository[Appointment]):
    """Data access layer for the `Appointment` model."""

    def __init__(self, db: Session) -> None:
        super().__init__(Appointment, db)

    def list_by_patient(self, patient_id: uuid.UUID) -> list[Appointment]:
        """Return all appointments a patient has requested, most recent first."""
        statement = (
            select(Appointment)
            .where(Appointment.patient_id == patient_id)
            .order_by(Appointment.requested_at.desc())
        )
        return list(self.db.execute(statement).scalars().all())

    def list_by_doctor(self, doctor_id: uuid.UUID) -> list[Appointment]:
        """Return all appointments requested with a doctor, most recent first."""
        statement = (
            select(Appointment)
            .where(Appointment.doctor_id == doctor_id)
            .order_by(Appointment.requested_at.desc())
        )
        return list(self.db.execute(statement).scalars().all())
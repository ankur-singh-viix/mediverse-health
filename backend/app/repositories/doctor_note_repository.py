"""
Doctor note repository.

Adds patient-scoped queries on top of the generic `BaseRepository`.
"""

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.doctor_note import DoctorNote
from app.repositories.base_repository import BaseRepository


class DoctorNoteRepository(BaseRepository[DoctorNote]):
    """Data access layer for the `DoctorNote` model."""

    def __init__(self, db: Session) -> None:
        super().__init__(DoctorNote, db)

    def list_by_patient(self, patient_id: uuid.UUID) -> list[DoctorNote]:
        """Return all clinical notes for a patient, most recent first."""
        statement = (
            select(DoctorNote)
            .where(DoctorNote.patient_id == patient_id)
            .order_by(DoctorNote.created_at.desc())
        )
        return list(self.db.execute(statement).scalars().all())
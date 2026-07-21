"""
Medical record repository.

Adds patient-scoped queries on top of the generic `BaseRepository`,
ensuring one patient can never read or modify another patient's
records.
"""

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.medical_record import MedicalRecord
from app.repositories.base_repository import BaseRepository


class MedicalRecordRepository(BaseRepository[MedicalRecord]):
    """Data access layer for the `MedicalRecord` model."""

    def __init__(self, db: Session) -> None:
        super().__init__(MedicalRecord, db)

    def list_by_patient(self, patient_id: uuid.UUID) -> list[MedicalRecord]:
        """Return all records for a patient, most recent first."""
        statement = (
            select(MedicalRecord)
            .where(MedicalRecord.patient_id == patient_id)
            .order_by(MedicalRecord.record_date.desc(), MedicalRecord.created_at.desc())
        )
        return list(self.db.execute(statement).scalars().all())

    def get_owned_by_patient(
        self, record_id: uuid.UUID, patient_id: uuid.UUID
    ) -> MedicalRecord | None:
        """Fetch a record only if it belongs to the given patient."""
        statement = select(MedicalRecord).where(
            MedicalRecord.id == record_id, MedicalRecord.patient_id == patient_id
        )
        return self.db.execute(statement).scalar_one_or_none()
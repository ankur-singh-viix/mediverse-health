"""
Prediction repository.

Adds patient-scoped queries on top of the generic `BaseRepository`.
"""

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.prediction import Prediction
from app.repositories.base_repository import BaseRepository


class PredictionRepository(BaseRepository[Prediction]):
    """Data access layer for the `Prediction` model."""

    def __init__(self, db: Session) -> None:
        super().__init__(Prediction, db)

    def list_by_patient(self, patient_id: uuid.UUID) -> list[Prediction]:
        """Return all symptom-check history for a patient, most recent first."""
        statement = (
            select(Prediction)
            .where(Prediction.patient_id == patient_id)
            .order_by(Prediction.created_at.desc())
        )
        return list(self.db.execute(statement).scalars().all())
"""
Patient profile repository.

Adds patient-profile-specific queries on top of the generic
`BaseRepository`.
"""

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.patient_profile import PatientProfile
from app.repositories.base_repository import BaseRepository


class PatientProfileRepository(BaseRepository[PatientProfile]):
    """Data access layer for the `PatientProfile` model."""

    def __init__(self, db: Session) -> None:
        super().__init__(PatientProfile, db)

    def get_by_user_id(self, user_id: uuid.UUID) -> PatientProfile | None:
        """Fetch a patient's profile by their user id."""
        statement = select(PatientProfile).where(PatientProfile.user_id == user_id)
        return self.db.execute(statement).scalar_one_or_none()
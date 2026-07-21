"""
Patient service.

Owns the business logic for a patient's profile and medical records.
Routers depend on this service only.
"""

import uuid
from datetime import date

from sqlalchemy.orm import Session

from app.exceptions.custom_exceptions import NotFoundException
from app.models.medical_record import MedicalRecord
from app.models.patient_profile import PatientProfile
from app.repositories.medical_record_repository import MedicalRecordRepository
from app.repositories.patient_repository import PatientProfileRepository
from app.schemas.patient import MedicalRecordCreateRequest, PatientProfileUpdateRequest


class PatientService:
    """Business logic for patient profiles and medical records."""

    def __init__(self, db: Session) -> None:
        self.db = db
        self.profile_repository = PatientProfileRepository(db)
        self.record_repository = MedicalRecordRepository(db)

    def get_or_create_profile(self, user_id: uuid.UUID) -> PatientProfile:
        """Return the patient's profile, creating an empty one on first access."""
        profile = self.profile_repository.get_by_user_id(user_id)
        if profile is None:
            profile = self.profile_repository.create(PatientProfile(user_id=user_id))
        return profile

    def update_profile(
        self, user_id: uuid.UUID, payload: PatientProfileUpdateRequest
    ) -> PatientProfile:
        """Create or update the patient's profile with the given fields."""
        profile = self.get_or_create_profile(user_id)

        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(profile, field, value)

        return self.profile_repository.update(profile)

    def list_records(self, patient_id: uuid.UUID) -> list[MedicalRecord]:
        """Return all medical records for the patient, most recent first."""
        return self.record_repository.list_by_patient(patient_id)

    def add_record(
        self, patient_id: uuid.UUID, payload: MedicalRecordCreateRequest
    ) -> MedicalRecord:
        """Create a new medical record entry for the patient."""
        record = MedicalRecord(
            patient_id=patient_id,
            title=payload.title,
            description=payload.description,
            record_date=payload.record_date or date.today(),
        )
        return self.record_repository.create(record)

    def delete_record(self, patient_id: uuid.UUID, record_id: uuid.UUID) -> None:
        """Delete a medical record, only if it belongs to the patient."""
        record = self.record_repository.get_owned_by_patient(record_id, patient_id)
        if record is None:
            raise NotFoundException("Medical record not found.")
        self.record_repository.delete(record)
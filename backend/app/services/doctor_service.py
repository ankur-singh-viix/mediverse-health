"""
Doctor service.

Owns the read-only business logic a doctor uses to browse the patient
roster and inspect an individual patient's profile and medical
records. Doctors never modify patient data in this phase - that
capability is intentionally out of scope for now.
"""

import uuid

from sqlalchemy.orm import Session

from app.exceptions.custom_exceptions import NotFoundException
from app.models.patient_profile import PatientProfile
from app.models.user import User, UserRole
from app.repositories.medical_record_repository import MedicalRecordRepository
from app.repositories.patient_repository import PatientProfileRepository
from app.repositories.user_repository import UserRepository


class DoctorService:
    """Business logic for a doctor's read-only view of patients."""

    def __init__(self, db: Session) -> None:
        self.db = db
        self.user_repository = UserRepository(db)
        self.profile_repository = PatientProfileRepository(db)
        self.record_repository = MedicalRecordRepository(db)

    def list_patients(self) -> list[User]:
        """Return every user with the 'patient' role."""
        return self.user_repository.list_by_role(UserRole.PATIENT)

    def get_patient_detail(self, patient_id: uuid.UUID) -> dict:
        """
        Return a patient's identity, profile, and medical records.

        Raises `NotFoundException` if no patient with that id exists.
        An empty profile is returned if the patient hasn't filled one
        in yet, matching the patient-facing auto-create behavior.
        """
        patient = self.user_repository.get_by_id(patient_id)
        if patient is None or patient.role != UserRole.PATIENT:
            raise NotFoundException("Patient not found.")

        profile = self.profile_repository.get_by_user_id(patient_id)
        if profile is None:
            profile = self.profile_repository.create(PatientProfile(user_id=patient_id))

        records = self.record_repository.list_by_patient(patient_id)

        return {"user": patient, "profile": profile, "records": records}
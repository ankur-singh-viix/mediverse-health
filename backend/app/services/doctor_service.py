"""
Doctor service.

Owns the business logic a doctor uses to browse the patient roster,
inspect a patient's profile/medical records/AI symptom-check history,
and add their own clinical notes. Doctors can never modify a patient's
own data (profile, records) - only add notes of their own.
"""

import uuid

from sqlalchemy.orm import Session

from app.exceptions.custom_exceptions import NotFoundException
from app.models.doctor_note import DoctorNote
from app.models.patient_profile import PatientProfile
from app.models.user import User, UserRole
from app.repositories.doctor_note_repository import DoctorNoteRepository
from app.repositories.medical_record_repository import MedicalRecordRepository
from app.repositories.patient_repository import PatientProfileRepository
from app.repositories.prediction_repository import PredictionRepository
from app.repositories.user_repository import UserRepository
from app.schemas.doctor import DoctorNoteResponse


class DoctorService:
    """Business logic for a doctor's view of, and notes on, patients."""

    def __init__(self, db: Session) -> None:
        self.db = db
        self.user_repository = UserRepository(db)
        self.profile_repository = PatientProfileRepository(db)
        self.record_repository = MedicalRecordRepository(db)
        self.prediction_repository = PredictionRepository(db)
        self.note_repository = DoctorNoteRepository(db)

    def list_patients(self) -> list[User]:
        """Return every user with the 'patient' role."""
        return self.user_repository.list_by_role(UserRole.PATIENT)

    def _get_patient_or_404(self, patient_id: uuid.UUID) -> User:
        patient = self.user_repository.get_by_id(patient_id)
        if patient is None or patient.role != UserRole.PATIENT:
            raise NotFoundException("Patient not found.")
        return patient

    def _build_note_responses(self, notes: list[DoctorNote]) -> list[DoctorNoteResponse]:
        """Attach each note's authoring doctor's name for display."""
        doctor_ids = {note.doctor_id for note in notes}
        doctors = {
            doctor_id: self.user_repository.get_by_id(doctor_id) for doctor_id in doctor_ids
        }
        return [
            DoctorNoteResponse(
                id=note.id,
                doctor_id=note.doctor_id,
                doctor_full_name=(doctors[note.doctor_id].full_name if doctors[note.doctor_id] else "Unknown"),
                note=note.note,
                created_at=note.created_at,
            )
            for note in notes
        ]

    def get_patient_detail(self, patient_id: uuid.UUID) -> dict:
        """
        Return a patient's identity, profile, medical records, AI
        symptom-check history, and any clinical notes doctors have
        added.

        Raises `NotFoundException` if no patient with that id exists.
        An empty profile is returned if the patient hasn't filled one
        in yet, matching the patient-facing auto-create behavior.
        """
        patient = self._get_patient_or_404(patient_id)

        profile = self.profile_repository.get_by_user_id(patient_id)
        if profile is None:
            profile = self.profile_repository.create(PatientProfile(user_id=patient_id))

        records = self.record_repository.list_by_patient(patient_id)
        predictions = self.prediction_repository.list_by_patient(patient_id)
        notes = self._build_note_responses(self.note_repository.list_by_patient(patient_id))

        return {
            "user": patient,
            "profile": profile,
            "records": records,
            "predictions": predictions,
            "notes": notes,
        }

    def add_note(self, doctor_id: uuid.UUID, patient_id: uuid.UUID, note_text: str) -> DoctorNote:
        """Add a clinical note about a patient, authored by the given doctor."""
        self._get_patient_or_404(patient_id)

        note = DoctorNote(patient_id=patient_id, doctor_id=doctor_id, note=note_text)
        return self.note_repository.create(note)
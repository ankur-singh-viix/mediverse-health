"""
Doctor note model.

A clinical note a doctor writes about a patient. Kept as a separate
table from `MedicalRecord` (which is patient-authored) so authorship
and visibility rules stay clear and simple: patients write records
about themselves, doctors write notes about patients they're viewing.
"""

import uuid

from sqlalchemy import ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.base_model import BaseModelMixin


class DoctorNote(BaseModelMixin, Base):
    """A single clinical note authored by a doctor about a patient."""

    __tablename__ = "doctor_notes"

    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    doctor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    note: Mapped[str] = mapped_column(Text, nullable=False)

    def __repr__(self) -> str:  # pragma: no cover
        return f"<DoctorNote id={self.id} patient_id={self.patient_id} doctor_id={self.doctor_id}>"
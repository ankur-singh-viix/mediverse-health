"""
Medical record model.

A simple, text-based medical record entry (no file attachments in
this phase, by design - keeps the module easy to run and deploy).
"""

import uuid
from datetime import date as date_type

from sqlalchemy import Date, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.base_model import BaseModelMixin


class MedicalRecord(BaseModelMixin, Base):
    """A single medical record entry belonging to a patient."""

    __tablename__ = "medical_records"

    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    record_date: Mapped[date_type] = mapped_column(Date, nullable=False)

    def __repr__(self) -> str:  # pragma: no cover
        return f"<MedicalRecord id={self.id} patient_id={self.patient_id} title={self.title}>"
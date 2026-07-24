"""
Prediction model.

Stores the result of a symptom check: what was reported and what the
engine concluded, so a patient (and their doctor) can see history over
time.
"""

import uuid

from sqlalchemy import Float, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.base_model import BaseModelMixin


class Prediction(BaseModelMixin, Base):
    """A single AI symptom-check result belonging to a patient."""

    __tablename__ = "predictions"

    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    symptoms: Mapped[str] = mapped_column(Text, nullable=False)  # comma-separated input
    predicted_condition: Mapped[str] = mapped_column(String(255), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    risk_level: Mapped[str] = mapped_column(String(20), nullable=False)
    advice: Mapped[str] = mapped_column(Text, nullable=False)

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Prediction id={self.id} patient_id={self.patient_id} condition={self.predicted_condition}>"
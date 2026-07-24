"""
Prediction feature schemas.

Request/response contracts for the AI symptom-checker endpoints.
"""

from pydantic import BaseModel, Field

from app.schemas.common import TimestampSchema, ORMBaseSchema


class SymptomCheckRequest(BaseModel):
    """Payload for submitting a symptom check."""

    symptoms: list[str] = Field(min_length=1, max_length=30)


class PredictionResponse(ORMBaseSchema, TimestampSchema):
    """A single stored symptom-check result."""

    symptoms: str
    predicted_condition: str
    confidence: float
    risk_level: str
    advice: str


class SymptomCheckResult(BaseModel):
    """
    Response returned immediately after running a symptom check.

    Wraps the stored `PredictionResponse` with the disclaimer and the
    specific symptoms that were matched, which aren't persisted as a
    separate column. `engine` reports which prediction engine produced
    this result ("ml_model" or "rule_based") for transparency.
    """

    prediction: PredictionResponse
    matched_symptoms: list[str]
    disclaimer: str
    engine: str
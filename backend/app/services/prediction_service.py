"""
Prediction service.

Bridges the AI engines with persistence. Routers depend on this
service only - they never call the AI engines directly.

Engine selection: the trained ML model (`app.ai.ml_predictor`) is the
PRIMARY engine. If it isn't available (model files missing) or none of
the reported symptoms are in its vocabulary, this service falls back
to the rule-based engine (`app.ai.symptom_checker`) so the feature
degrades gracefully instead of failing.
"""

import uuid

from sqlalchemy.orm import Session

from app.ai import ml_predictor
from app.ai.symptom_checker import ALL_SYMPTOMS, DISCLAIMER, analyze_symptoms
from app.models.prediction import Prediction
from app.repositories.prediction_repository import PredictionRepository


class PredictionService:
    """Business logic for running and retrieving AI symptom checks."""

    def __init__(self, db: Session) -> None:
        self.db = db
        self.repository = PredictionRepository(db)

    @staticmethod
    def list_available_symptoms() -> list[str]:
        """
        Return the full list of symptom keywords the active engine
        recognizes. Prefers the trained model's (much larger) vocabulary
        when available, falling back to the rule-based engine's list.
        """
        if ml_predictor.is_available():
            return ml_predictor.get_symptom_vocabulary()
        return list(ALL_SYMPTOMS)

    def run_check(self, patient_id: uuid.UUID, symptoms: list[str]) -> tuple[Prediction, list[str], str]:
        """
        Run the AI engine against the reported symptoms, persist the
        result, and return the stored record, the matched symptom
        keywords, and which engine produced the result.
        """
        ml_result = ml_predictor.predict(symptoms)

        if ml_result is not None:
            condition = ml_result.condition
            confidence = ml_result.confidence
            risk_level = ml_result.risk_level
            advice = ml_result.advice
            matched_symptoms = ml_result.matched_symptoms
            engine = "ml_model"
        else:
            rule_result = analyze_symptoms(symptoms)
            condition = rule_result.condition
            confidence = rule_result.confidence
            risk_level = rule_result.risk_level
            advice = rule_result.advice
            matched_symptoms = rule_result.matched_symptoms
            engine = "rule_based"

        prediction = Prediction(
            patient_id=patient_id,
            symptoms=", ".join(symptoms),
            predicted_condition=condition,
            confidence=confidence,
            risk_level=risk_level,
            advice=advice,
        )
        prediction = self.repository.create(prediction)

        return prediction, matched_symptoms, engine

    def list_history(self, patient_id: uuid.UUID) -> list[Prediction]:
        """Return a patient's full symptom-check history."""
        return self.repository.list_by_patient(patient_id)

    @staticmethod
    def get_disclaimer() -> str:
        return DISCLAIMER
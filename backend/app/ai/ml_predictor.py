"""
ML-based symptom checker.

Loads a trained Decision Tree classifier (see /ml/train_model.py at
the repo root for the training pipeline) and uses it as the platform's
primary prediction engine.

Returns `None` from `predict()` if the model artifacts failed to load,
or if none of the reported symptoms are in the model's vocabulary -
signalling the caller (PredictionService) to fall back to the
rule-based engine in `app.ai.symptom_checker`. This keeps the AI
feature resilient even if model files are missing.
"""

import json
from dataclasses import dataclass, field
from pathlib import Path

import joblib

MODEL_DIR = Path(__file__).resolve().parent / "model"

_model = None
_symptom_list: list[str] = []
_disease_metadata: dict[str, dict] = {}

try:
    _model = joblib.load(MODEL_DIR / "disease_model.joblib")
    _symptom_list = json.loads((MODEL_DIR / "symptom_list.json").read_text(encoding="utf-8"))
    _disease_metadata = json.loads(
        (MODEL_DIR / "disease_metadata.json").read_text(encoding="utf-8")
    )
except Exception:  # pragma: no cover - defensive: missing/corrupt model artifacts
    _model = None


def is_available() -> bool:
    """Whether the trained model loaded successfully."""
    return _model is not None


def get_symptom_vocabulary() -> list[str]:
    """The full list of symptom keys the trained model recognizes."""
    return list(_symptom_list)


@dataclass
class MLPredictionResult:
    condition: str
    confidence: float
    risk_level: str
    advice: str
    matched_symptoms: list[str] = field(default_factory=list)


def predict(symptoms: list[str]) -> MLPredictionResult | None:
    """
    Predict the most likely condition from reported symptoms using the
    trained model. Returns None (triggering the rule-based fallback)
    if the model isn't loaded or no reported symptom is recognized.
    """
    if _model is None:
        return None

    normalized = {s.strip().lower().replace(" ", "_") for s in symptoms if s.strip()}
    matched = [s for s in _symptom_list if s in normalized]

    if not matched:
        return None

    feature_vector = [[1 if symptom in matched else 0 for symptom in _symptom_list]]
    predicted_class = _model.predict(feature_vector)[0]
    probabilities = _model.predict_proba(feature_vector)[0]
    class_index = list(_model.classes_).index(predicted_class)
    confidence = float(probabilities[class_index])

    meta = _disease_metadata.get(predicted_class, {})
    precautions: list[str] = meta.get("precautions", [])
    advice = (
        "Recommended precautions: " + ", ".join(precautions)
        if precautions
        else meta.get("description") or "Please consult a doctor for evaluation."
    )
    risk_level = meta.get("risk_level", "medium")

    return MLPredictionResult(
        condition=predicted_class,
        confidence=round(confidence, 2),
        risk_level=risk_level,
        advice=advice,
        matched_symptoms=sorted(matched),
    )
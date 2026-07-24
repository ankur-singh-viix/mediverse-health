"""
Rule-based symptom checker.

A deliberately simple, transparent scoring engine: each known
condition has an associated set of symptom keywords. Given a set of
reported symptoms, we score every condition by keyword overlap and
return the best match (or "unable to determine" if nothing matches
well). This is intentionally NOT a diagnostic tool - see `DISCLAIMER`.

Kept as a pure, dependency-free module so it can be swapped for a
trained ML model in a future phase without changing the service or
API layers built on top of it.
"""

from dataclasses import dataclass, field

DISCLAIMER = (
    "This tool provides general, educational suggestions only and is not "
    "a medical diagnosis. Always consult a licensed physician for "
    "accurate diagnosis and treatment, especially if symptoms are severe "
    "or persistent."
)


@dataclass(frozen=True)
class ConditionRule:
    name: str
    keywords: frozenset[str]
    risk_level: str  # "low" | "medium" | "high"
    advice: str


CONDITION_RULES: tuple[ConditionRule, ...] = (
    ConditionRule(
        name="Common Cold",
        keywords=frozenset({"cough", "runny nose", "sneezing", "sore throat", "mild fever", "congestion"}),
        risk_level="low",
        advice="Rest, stay hydrated, and monitor symptoms. Usually resolves within 7-10 days.",
    ),
    ConditionRule(
        name="Influenza (Flu)",
        keywords=frozenset({"fever", "chills", "body ache", "fatigue", "headache", "cough", "sore throat"}),
        risk_level="medium",
        advice="Rest and stay hydrated. See a doctor if fever persists beyond 3 days or worsens.",
    ),
    ConditionRule(
        name="Migraine",
        keywords=frozenset({"headache", "nausea", "sensitivity to light", "blurred vision", "dizziness"}),
        risk_level="low",
        advice="Rest in a dark, quiet room. Consult a doctor if migraines are frequent or severe.",
    ),
    ConditionRule(
        name="Food Poisoning",
        keywords=frozenset({"nausea", "vomiting", "diarrhea", "stomach pain", "fever"}),
        risk_level="medium",
        advice="Stay hydrated with fluids. Seek care if symptoms persist beyond 48 hours or you notice blood.",
    ),
    ConditionRule(
        name="Allergic Reaction",
        keywords=frozenset({"rash", "itching", "swelling", "hives", "sneezing", "watery eyes"}),
        risk_level="medium",
        advice="Avoid the suspected allergen. Seek immediate care if you have trouble breathing or facial swelling.",
    ),
    ConditionRule(
        name="Possible Viral Infection (incl. COVID-19)",
        keywords=frozenset(
            {"fever", "cough", "fatigue", "loss of taste", "loss of smell", "shortness of breath", "sore throat"}
        ),
        risk_level="high",
        advice="Consider isolating and getting tested. Seek immediate care if you have difficulty breathing.",
    ),
    ConditionRule(
        name="Dehydration",
        keywords=frozenset({"thirst", "dizziness", "dry mouth", "fatigue", "dark urine", "headache"}),
        risk_level="medium",
        advice="Increase fluid intake immediately. Seek medical care if symptoms don't improve.",
    ),
    ConditionRule(
        name="Anxiety / Panic Symptoms",
        keywords=frozenset({"chest pain", "rapid heartbeat", "shortness of breath", "sweating", "dizziness", "restlessness"}),
        risk_level="medium",
        advice="Try slow, deep breathing and grounding techniques. Consult a doctor if this happens often.",
    ),
    ConditionRule(
        name="Possible Cardiovascular Concern",
        keywords=frozenset({"chest pain", "shortness of breath", "dizziness", "headache", "blurred vision"}),
        risk_level="high",
        advice="Monitor closely and consult a doctor promptly, especially with chest pain - seek emergency care if severe.",
    ),
)

ALL_SYMPTOMS: tuple[str, ...] = tuple(
    sorted({keyword for rule in CONDITION_RULES for keyword in rule.keywords})
)


@dataclass
class PredictionResult:
    condition: str
    confidence: float  # 0.0 - 1.0
    risk_level: str
    advice: str
    matched_symptoms: list[str] = field(default_factory=list)
    disclaimer: str = DISCLAIMER


_NO_MATCH_RESULT = PredictionResult(
    condition="Unable to determine",
    confidence=0.0,
    risk_level="low",
    advice="Your symptoms don't clearly match a known pattern. Please consult a doctor for a proper evaluation.",
    matched_symptoms=[],
)

_MIN_CONFIDENCE_THRESHOLD = 0.34


def analyze_symptoms(symptoms: list[str]) -> PredictionResult:
    """
    Score every known condition against the reported symptoms and
    return the best match. Confidence is the fraction of a condition's
    keywords that were matched (simple overlap ratio).
    """
    normalized = {s.strip().lower() for s in symptoms if s.strip()}

    if not normalized:
        return _NO_MATCH_RESULT

    best_rule: ConditionRule | None = None
    best_matches: set[str] = set()
    best_confidence = 0.0

    for rule in CONDITION_RULES:
        matches = normalized & rule.keywords
        if not matches:
            continue
        confidence = len(matches) / len(rule.keywords)
        if confidence > best_confidence:
            best_confidence = confidence
            best_rule = rule
            best_matches = matches

    if best_rule is None or best_confidence < _MIN_CONFIDENCE_THRESHOLD:
        return _NO_MATCH_RESULT

    return PredictionResult(
        condition=best_rule.name,
        confidence=round(best_confidence, 2),
        risk_level=best_rule.risk_level,
        advice=best_rule.advice,
        matched_symptoms=sorted(best_matches),
    )
"""
Disease prediction model - training script.

A deliberately SIMPLE pipeline: clean the data, split train/test,
train one lightweight model (Decision Tree), evaluate it, save it.

Runs in well under a second on any machine - this dataset is tiny
(under 1MB) and the model has no heavy tuning or GPU requirement.

Usage:
    python train_model.py

Outputs (into ./model_output/):
    disease_model.joblib      - the trained classifier
    symptom_list.json         - ordered list of symptom feature names
    disease_metadata.json     - per-disease description/precautions/risk
"""

import csv
import json
from pathlib import Path

import joblib
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, classification_report

DATA_DIR = Path(__file__).resolve().parent / "data"
OUTPUT_DIR = Path(__file__).resolve().parent / "model_output"
OUTPUT_DIR.mkdir(exist_ok=True)


# ---------------------------------------------------------------------
# Step 1: Load and clean the raw dataset
# ---------------------------------------------------------------------
def load_raw_rows() -> list[list[str]]:
    """
    dataset.csv has rows like:
        Disease, symptom_1, symptom_2, ..., (variable length, blank cells)
    Symptom names have inconsistent leading/trailing whitespace.
    """
    rows = []
    with open(DATA_DIR / "dataset.csv", newline="", encoding="utf-8") as f:
        reader = csv.reader(f)
        for row in reader:
            row = [cell.strip() for cell in row if cell.strip()]
            if row:
                rows.append(row)
    return rows


def build_dataset(rows: list[list[str]]) -> tuple[list[dict], list[str], list[str]]:
    """
    Convert variable-length symptom rows into a fixed-width, one-hot
    style feature table: one column per unique symptom, 1 if present.
    """
    all_symptoms = sorted({symptom for row in rows for symptom in row[1:]})

    features: list[dict] = []
    labels: list[str] = []

    for row in rows:
        disease, symptoms = row[0], set(row[1:])
        features.append({symptom: int(symptom in symptoms) for symptom in all_symptoms})
        labels.append(disease)

    return features, labels, all_symptoms


# ---------------------------------------------------------------------
# Step 2: Load supplementary metadata (description, precautions, severity)
# ---------------------------------------------------------------------
def load_metadata() -> dict[str, dict]:
    descriptions: dict[str, str] = {}
    with open(DATA_DIR / "symptom_description.csv", newline="", encoding="utf-8") as f:
        for row in csv.reader(f):
            if len(row) >= 2:
                descriptions[row[0].strip()] = row[1].strip()

    precautions: dict[str, list[str]] = {}
    with open(DATA_DIR / "symptom_precaution.csv", newline="", encoding="utf-8") as f:
        for row in csv.reader(f):
            if row:
                disease = row[0].strip()
                steps = [cell.strip() for cell in row[1:] if cell.strip()]
                precautions[disease] = steps

    severity: dict[str, int] = {}
    with open(DATA_DIR / "symptom_severity.csv", newline="", encoding="utf-8") as f:
        for row in csv.reader(f):
            if len(row) >= 2 and row[1].strip().isdigit():
                severity[row[0].strip()] = int(row[1].strip())

    diseases = set(descriptions) | set(precautions)
    metadata = {}
    for disease in diseases:
        metadata[disease] = {
            "description": descriptions.get(disease, ""),
            "precautions": precautions.get(disease, []),
        }
    return metadata, severity


def risk_level_for_disease(disease: str, disease_symptom_map: dict[str, set[str]], severity: dict[str, int]) -> str:
    """Derive a coarse risk level from the average severity of a disease's symptoms."""
    symptoms = disease_symptom_map.get(disease, set())
    scores = [severity[s] for s in symptoms if s in severity]
    if not scores:
        return "medium"
    avg = sum(scores) / len(scores)
    if avg >= 5:
        return "high"
    if avg >= 3:
        return "medium"
    return "low"


# ---------------------------------------------------------------------
# Main pipeline
# ---------------------------------------------------------------------
def main() -> None:
    print("Step 1: Loading dataset...")
    rows = load_raw_rows()
    print(f"  {len(rows)} patient records loaded")

    features, labels, all_symptoms = build_dataset(rows)
    print(f"  {len(all_symptoms)} unique symptoms, {len(set(labels))} unique diseases")

    print("\nStep 2: Preparing train/test split...")
    X = [[row[symptom] for symptom in all_symptoms] for row in features]
    y = labels
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"  Train size: {len(X_train)}, Test size: {len(X_test)}")

    print("\nStep 3: Training Decision Tree classifier...")
    # No max_depth cap: with 41 classes and only ~304 unique symptom
    # patterns in this dataset, a shallow tree can't create a pure leaf
    # for every disease. An uncapped tree can - and should, given this
    # dataset's structure (see note on accuracy below).
    model = DecisionTreeClassifier(random_state=42)
    model.fit(X_train, y_train)
    print("  Done.")

    print("\nStep 4: Evaluating on held-out test set...")
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"  Test accuracy: {accuracy:.4f} ({accuracy * 100:.2f}%)")

    cv_scores = cross_val_score(model, X, y, cv=5)
    print(f"  5-fold cross-validation accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")

    print("\n  Classification report:")
    print(classification_report(y_test, y_pred, zero_division=0))

    print(
        "  NOTE: Near-100% accuracy is expected and explainable for THIS dataset, not a\n"
        "  red flag to hide: each disease maps to a small, fixed set of exact symptom\n"
        "  combinations (only ~304 unique patient patterns across 4,920 rows), so the\n"
        "  same patterns repeat across the train/test split and a decision tree can\n"
        "  learn the mapping exactly. This is a known property of this public\n"
        "  educational dataset - real-world clinical data would be noisier and this\n"
        "  approach would need a probabilistic model and more features to match. Being\n"
        "  able to explain *why* the accuracy is high is the important part for a viva."
    )

    print("Step 5: Saving model and metadata...")
    joblib.dump(model, OUTPUT_DIR / "disease_model.joblib")

    with open(OUTPUT_DIR / "symptom_list.json", "w", encoding="utf-8") as f:
        json.dump(all_symptoms, f, indent=2)

    disease_symptom_map: dict[str, set[str]] = {}
    for row in rows:
        disease, symptoms = row[0], set(row[1:])
        disease_symptom_map.setdefault(disease, set()).update(symptoms)

    metadata, severity = load_metadata()
    for disease in set(labels):
        entry = metadata.setdefault(disease, {"description": "", "precautions": []})
        entry["risk_level"] = risk_level_for_disease(disease, disease_symptom_map, severity)

    with open(OUTPUT_DIR / "disease_metadata.json", "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print(f"  Saved to {OUTPUT_DIR}/")
    print("\nDone. Copy the 3 files in model_output/ into backend/app/ai/model/")


if __name__ == "__main__":
    main()
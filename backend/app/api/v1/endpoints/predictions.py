"""
Prediction endpoints.

Lets an authenticated patient run an AI symptom check and view their
own history. The available-symptoms list is public reference data and
requires no authentication.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.auth.dependencies import require_role
from app.db.session import get_db
from app.models.user import User, UserRole
from app.schemas.prediction import PredictionResponse, SymptomCheckRequest, SymptomCheckResult
from app.services.prediction_service import PredictionService

router = APIRouter()


@router.get("/symptoms", response_model=list[str], summary="List recognized symptom keywords")
def list_symptoms() -> list[str]:
    return PredictionService.list_available_symptoms()


@router.post(
    "/check",
    response_model=SymptomCheckResult,
    status_code=status.HTTP_201_CREATED,
    summary="Run an AI symptom check",
)
def run_symptom_check(
    payload: SymptomCheckRequest,
    current_user: User = Depends(require_role(UserRole.PATIENT)),
    db: Session = Depends(get_db),
) -> SymptomCheckResult:
    service = PredictionService(db)
    prediction, matched_symptoms, engine = service.run_check(current_user.id, payload.symptoms)
    return SymptomCheckResult(
        prediction=prediction,
        matched_symptoms=matched_symptoms,
        disclaimer=service.get_disclaimer(),
        engine=engine,
    )


@router.get(
    "/history",
    response_model=list[PredictionResponse],
    summary="List my symptom-check history",
)
def list_my_history(
    current_user: User = Depends(require_role(UserRole.PATIENT)),
    db: Session = Depends(get_db),
) -> list[PredictionResponse]:
    return PredictionService(db).list_history(current_user.id)
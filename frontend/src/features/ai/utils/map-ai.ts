import type {
  Prediction,
  PredictionApiResponse,
  SymptomCheckResult,
  SymptomCheckResultApiResponse,
} from "@/features/ai/types/ai.types";

export function mapApiPredictionToPrediction(api: PredictionApiResponse): Prediction {
  return {
    id: api.id,
    symptoms: api.symptoms,
    predictedCondition: api.predicted_condition,
    confidence: api.confidence,
    riskLevel: api.risk_level,
    advice: api.advice,
    createdAt: api.created_at,
  };
}

export function mapApiResultToResult(api: SymptomCheckResultApiResponse): SymptomCheckResult {
  return {
    prediction: mapApiPredictionToPrediction(api.prediction),
    matchedSymptoms: api.matched_symptoms,
    disclaimer: api.disclaimer,
    engine: api.engine,
  };
}
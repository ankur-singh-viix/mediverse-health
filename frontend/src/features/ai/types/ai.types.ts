/**
 * AI symptom-checker feature types.
 *
 * The backend's symptom keywords and risk levels are plain strings
 * (not fixed enums on the frontend), since the rule-based engine's
 * vocabulary can grow without a frontend type change.
 */

export type RiskLevel = "low" | "medium" | "high";

export interface PredictionApiResponse {
  id: string;
  symptoms: string;
  predicted_condition: string;
  confidence: number;
  risk_level: RiskLevel;
  advice: string;
  created_at: string;
}

export interface Prediction {
  id: string;
  symptoms: string;
  predictedCondition: string;
  confidence: number;
  riskLevel: RiskLevel;
  advice: string;
  createdAt: string;
}

export interface SymptomCheckResultApiResponse {
  prediction: PredictionApiResponse;
  matched_symptoms: string[];
  disclaimer: string;
  engine: string;
}

export interface SymptomCheckResult {
  prediction: Prediction;
  matchedSymptoms: string[];
  disclaimer: string;
  engine: string;
}
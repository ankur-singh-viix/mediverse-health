import { apiClient } from "@/lib/axios";
import type {
  PredictionApiResponse,
  SymptomCheckResultApiResponse,
} from "@/features/ai/types/ai.types";

export async function fetchAvailableSymptoms(): Promise<string[]> {
  const { data } = await apiClient.get<string[]>("/predictions/symptoms");
  return data;
}

export async function runSymptomCheck(
  symptoms: string[]
): Promise<SymptomCheckResultApiResponse> {
  const { data } = await apiClient.post<SymptomCheckResultApiResponse>("/predictions/check", {
    symptoms,
  });
  return data;
}

export async function fetchPredictionHistory(): Promise<PredictionApiResponse[]> {
  const { data } = await apiClient.get<PredictionApiResponse[]>("/predictions/history");
  return data;
}
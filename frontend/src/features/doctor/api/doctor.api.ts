import { apiClient } from "@/lib/axios";
import type {
  PatientDetailApiResponse,
  PatientSummaryApiResponse,
} from "@/features/doctor/types/doctor.types";

export async function fetchPatients(): Promise<PatientSummaryApiResponse[]> {
  const { data } = await apiClient.get<PatientSummaryApiResponse[]>("/doctors/patients");
  return data;
}

export async function fetchPatientDetail(patientId: string): Promise<PatientDetailApiResponse> {
  const { data } = await apiClient.get<PatientDetailApiResponse>(
    `/doctors/patients/${patientId}`
  );
  return data;
}

import type {
  PatientSummary,
  PatientSummaryApiResponse,
} from "@/features/doctor/types/doctor.types";

export function mapApiPatientSummaryToPatientSummary(
  api: PatientSummaryApiResponse
): PatientSummary {
  return {
    id: api.id,
    fullName: api.full_name,
    email: api.email,
    isActive: api.is_active,
    createdAt: api.created_at,
  };
}
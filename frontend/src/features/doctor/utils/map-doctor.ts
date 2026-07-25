import type {
  DoctorNote,
  DoctorNoteApiResponse,
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

export function mapApiNoteToNote(api: DoctorNoteApiResponse): DoctorNote {
  return {
    id: api.id,
    doctorId: api.doctor_id,
    doctorFullName: api.doctor_full_name,
    note: api.note,
    createdAt: api.created_at,
  };
}
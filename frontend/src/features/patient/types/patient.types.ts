/**
 * Patient feature types.
 *
 * `*ApiResponse` / `*ApiPayload` types mirror the backend's snake_case
 * JSON contract exactly. App-facing types use camelCase and are mapped
 * to/from the wire format in `utils/map-patient.ts` and `api/patient.api.ts`.
 */

export type Gender = "male" | "female" | "other";

export interface PatientProfileApiResponse {
  id: string;
  user_id: string;
  date_of_birth: string | null;
  gender: Gender | null;
  blood_group: string | null;
  phone_number: string | null;
  address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface PatientProfile {
  id: string;
  userId: string;
  dateOfBirth: string | null;
  gender: Gender | null;
  bloodGroup: string | null;
  phoneNumber: string | null;
  address: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
}

export interface PatientProfileUpdatePayload {
  dateOfBirth?: string | null;
  gender?: Gender | null;
  bloodGroup?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
}

export interface MedicalRecordApiResponse {
  id: string;
  title: string;
  description: string | null;
  record_date: string;
  created_at: string;
  updated_at: string;
}

export interface MedicalRecord {
  id: string;
  title: string;
  description: string | null;
  recordDate: string;
  createdAt: string;
}

export interface MedicalRecordCreatePayload {
  title: string;
  description?: string;
  recordDate?: string;
}
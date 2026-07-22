/**
 * Doctor feature types.
 *
 * `*ApiResponse` types mirror the backend's snake_case JSON contract.
 * App-facing types use camelCase and are mapped in `utils/map-doctor.ts`.
 */
import type { UserRole } from "@/types/user";
import type {
  MedicalRecordApiResponse,
  PatientProfileApiResponse,
} from "@/features/patient/types/patient.types";

export interface PatientSummaryApiResponse {
  id: string;
  full_name: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface PatientSummary {
  id: string;
  fullName: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export interface PatientUserApiResponse {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface PatientDetailApiResponse {
  user: PatientUserApiResponse;
  profile: PatientProfileApiResponse;
  records: MedicalRecordApiResponse[];
}
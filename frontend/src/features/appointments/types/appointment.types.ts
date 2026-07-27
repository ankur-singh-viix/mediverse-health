/**
 * Appointment feature types.
 *
 * `*ApiResponse` types mirror the backend's snake_case JSON contract.
 * App-facing types use camelCase and are mapped in `utils/map-appointment.ts`.
 */

export type AppointmentStatus = "pending" | "confirmed" | "declined" | "cancelled" | "completed";

export interface DoctorOptionApiResponse {
  id: string;
  full_name: string;
  email: string;
}

export interface DoctorOption {
  id: string;
  fullName: string;
  email: string;
}

export interface AppointmentApiResponse {
  id: string;
  patient_id: string;
  patient_full_name: string;
  doctor_id: string;
  doctor_full_name: string;
  requested_at: string;
  reason: string | null;
  status: AppointmentStatus;
  note: string | null;
  created_at: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientFullName: string;
  doctorId: string;
  doctorFullName: string;
  requestedAt: string;
  reason: string | null;
  status: AppointmentStatus;
  note: string | null;
  createdAt: string;
}

export interface AppointmentCreatePayload {
  doctorId: string;
  requestedAt: string;
  reason?: string;
}
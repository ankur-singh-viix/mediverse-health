import type {
  Appointment,
  AppointmentApiResponse,
  DoctorOption,
  DoctorOptionApiResponse,
} from "@/features/appointments/types/appointment.types";

export function mapApiDoctorOptionToDoctorOption(api: DoctorOptionApiResponse): DoctorOption {
  return {
    id: api.id,
    fullName: api.full_name,
    email: api.email,
  };
}

export function mapApiAppointmentToAppointment(api: AppointmentApiResponse): Appointment {
  return {
    id: api.id,
    patientId: api.patient_id,
    patientFullName: api.patient_full_name,
    doctorId: api.doctor_id,
    doctorFullName: api.doctor_full_name,
    requestedAt: api.requested_at,
    reason: api.reason,
    status: api.status,
    note: api.note,
    createdAt: api.created_at,
  };
}
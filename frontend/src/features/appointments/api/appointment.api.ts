import { apiClient } from "@/lib/axios";
import type {
  AppointmentApiResponse,
  AppointmentCreatePayload,
  DoctorOptionApiResponse,
} from "@/features/appointments/types/appointment.types";

export async function fetchAvailableDoctors(): Promise<DoctorOptionApiResponse[]> {
  const { data } = await apiClient.get<DoctorOptionApiResponse[]>("/appointments/doctors");
  return data;
}

export async function createAppointment(
  payload: AppointmentCreatePayload
): Promise<AppointmentApiResponse> {
  const { data } = await apiClient.post<AppointmentApiResponse>("/appointments", {
    doctor_id: payload.doctorId,
    requested_at: payload.requestedAt,
    reason: payload.reason || undefined,
  });
  return data;
}

export async function fetchMyAppointments(): Promise<AppointmentApiResponse[]> {
  const { data } = await apiClient.get<AppointmentApiResponse[]>("/appointments/me");
  return data;
}

export async function cancelAppointment(appointmentId: string): Promise<AppointmentApiResponse> {
  const { data } = await apiClient.patch<AppointmentApiResponse>(
    `/appointments/${appointmentId}/cancel`
  );
  return data;
}

export async function fetchDoctorAppointments(): Promise<AppointmentApiResponse[]> {
  const { data } = await apiClient.get<AppointmentApiResponse[]>("/appointments/doctor/me");
  return data;
}

export async function respondToAppointment(
  appointmentId: string,
  status: "confirmed" | "declined"
): Promise<AppointmentApiResponse> {
  const { data } = await apiClient.patch<AppointmentApiResponse>(
    `/appointments/${appointmentId}/respond`,
    { status }
  );
  return data;
}
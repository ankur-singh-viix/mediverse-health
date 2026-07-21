import { apiClient } from "@/lib/axios";
import type {
  MedicalRecordApiResponse,
  MedicalRecordCreatePayload,
  PatientProfileApiResponse,
  PatientProfileUpdatePayload,
} from "@/features/patient/types/patient.types";

export async function fetchMyProfile(): Promise<PatientProfileApiResponse> {
  const { data } = await apiClient.get<PatientProfileApiResponse>("/patients/me/profile");
  return data;
}

export async function updateMyProfile(
  payload: PatientProfileUpdatePayload
): Promise<PatientProfileApiResponse> {
  const { data } = await apiClient.put<PatientProfileApiResponse>("/patients/me/profile", {
    date_of_birth: payload.dateOfBirth,
    gender: payload.gender,
    blood_group: payload.bloodGroup,
    phone_number: payload.phoneNumber,
    address: payload.address,
    emergency_contact_name: payload.emergencyContactName,
    emergency_contact_phone: payload.emergencyContactPhone,
  });
  return data;
}

export async function fetchMyRecords(): Promise<MedicalRecordApiResponse[]> {
  const { data } = await apiClient.get<MedicalRecordApiResponse[]>("/patients/me/records");
  return data;
}

export async function createMyRecord(
  payload: MedicalRecordCreatePayload
): Promise<MedicalRecordApiResponse> {
  const { data } = await apiClient.post<MedicalRecordApiResponse>("/patients/me/records", {
    title: payload.title,
    description: payload.description || undefined,
    record_date: payload.recordDate || undefined,
  });
  return data;
}

export async function deleteMyRecord(recordId: string): Promise<void> {
  await apiClient.delete(`/patients/me/records/${recordId}`);
}
import type {
  MedicalRecord,
  MedicalRecordApiResponse,
  PatientProfile,
  PatientProfileApiResponse,
} from "@/features/patient/types/patient.types";

export function mapApiProfileToProfile(api: PatientProfileApiResponse): PatientProfile {
  return {
    id: api.id,
    userId: api.user_id,
    dateOfBirth: api.date_of_birth,
    gender: api.gender,
    bloodGroup: api.blood_group,
    phoneNumber: api.phone_number,
    address: api.address,
    emergencyContactName: api.emergency_contact_name,
    emergencyContactPhone: api.emergency_contact_phone,
  };
}

export function mapApiRecordToRecord(api: MedicalRecordApiResponse): MedicalRecord {
  return {
    id: api.id,
    title: api.title,
    description: api.description,
    recordDate: api.record_date,
    createdAt: api.created_at,
  };
}
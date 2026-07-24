/**
 * Centralized route path constants.
 *
 * Using named constants instead of hardcoded strings keeps navigation
 * and route definitions in sync as the route tree grows in future
 * phases.
 */
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  PATIENT_DASHBOARD: "/patient/dashboard",
  PATIENT_PROFILE: "/patient/profile",
  PATIENT_RECORDS: "/patient/records",
  PATIENT_SYMPTOM_CHECKER: "/patient/symptom-checker",
  DOCTOR_DASHBOARD: "/doctor/dashboard",
  DOCTOR_PATIENT_DETAIL: "/doctor/patients/:patientId",
  NOT_FOUND: "*",
} as const;
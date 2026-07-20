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
  DOCTOR_DASHBOARD: "/doctor/dashboard",
  NOT_FOUND: "*",
} as const;

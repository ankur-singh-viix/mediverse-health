/**
 * Auth feature types (structure only).
 *
 * Shapes mirror the future auth API contract. No requests are wired
 * up yet in Phase 0.
 */
import type { UserRole } from "@/types/user";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

/**
 * Auth feature types.
 *
 * `*ApiResponse` / `*ApiPayload` types mirror the backend's snake_case
 * JSON contract exactly. App-facing types (`LoginPayload`,
 * `RegisterPayload`) use camelCase and are mapped to/from the wire
 * format in `auth.api.ts`.
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

/** Raw user shape as returned by the API (snake_case). */
export interface UserApiResponse {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

/** Raw token pair shape as returned by the API (snake_case). */
export interface TokenApiResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

/** Raw auth response shape as returned by the API (snake_case). */
export interface AuthApiResponse extends TokenApiResponse {
  user: UserApiResponse;
}

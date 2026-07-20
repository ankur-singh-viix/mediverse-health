/**
 * Auth API layer (structure only).
 *
 * Defines the request functions the auth feature will use once the
 * backend authentication module is implemented. Intentionally
 * unimplemented in Phase 0 - calling these will reject.
 */
import type { AuthResponse, LoginPayload, RegisterPayload } from "@/features/auth/types/auth.types";

const NOT_IMPLEMENTED = "Authentication is not implemented in Phase 0.";

export async function loginRequest(_payload: LoginPayload): Promise<AuthResponse> {
  return Promise.reject(new Error(NOT_IMPLEMENTED));
}

export async function registerRequest(_payload: RegisterPayload): Promise<AuthResponse> {
  return Promise.reject(new Error(NOT_IMPLEMENTED));
}

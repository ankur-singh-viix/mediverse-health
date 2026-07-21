/**
 * Auth API layer.
 *
 * Thin wrappers around the backend's `/auth/*` endpoints. Converts
 * between the app's camelCase payload types and the API's snake_case
 * wire format.
 */
import { apiClient } from "@/lib/axios";
import type {
  AuthApiResponse,
  LoginPayload,
  RegisterPayload,
  UserApiResponse,
} from "@/features/auth/types/auth.types";

export async function loginRequest(payload: LoginPayload): Promise<AuthApiResponse> {
  const { data } = await apiClient.post<AuthApiResponse>("/auth/login", {
    email: payload.email,
    password: payload.password,
  });
  return data;
}

export async function registerRequest(payload: RegisterPayload): Promise<AuthApiResponse> {
  const { data } = await apiClient.post<AuthApiResponse>("/auth/register", {
    full_name: payload.fullName,
    email: payload.email,
    password: payload.password,
    role: payload.role,
  });
  return data;
}

export async function fetchCurrentUser(): Promise<UserApiResponse> {
  const { data } = await apiClient.get<UserApiResponse>("/auth/me");
  return data;
}

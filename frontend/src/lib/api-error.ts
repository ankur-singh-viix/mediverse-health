import { AxiosError } from "axios";

interface ApiErrorBody {
  success: false;
  error: string;
  detail: string | Array<{ msg?: string }> | null;
  status_code: number;
}

/**
 * Extracts a human-readable error message from an Axios error thrown
 * by a request to the MediVerse API, falling back to a generic
 * message for network errors or unexpected shapes.
 */
export function getApiErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (error instanceof AxiosError) {
    const body = error.response?.data as ApiErrorBody | undefined;

    if (body?.detail) {
      if (typeof body.detail === "string") {
        return body.detail;
      }
      if (Array.isArray(body.detail) && body.detail[0]?.msg) {
        return body.detail[0].msg;
      }
    }

    if (error.code === "ECONNABORTED" || error.message === "Network Error") {
      return "Unable to reach the server. Please check your connection.";
    }
  }

  return fallback;
}

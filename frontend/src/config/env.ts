/**
 * Centralized environment configuration.
 *
 * All `import.meta.env` access should go through this module so env
 * variables are validated and typed in one place instead of scattered
 * across the codebase.
 */

interface AppConfig {
  apiBaseUrl: string;
  appName: string;
  appEnv: "development" | "production" | "test";
}

function readEnv(key: string, fallback: string): string {
  const value = import.meta.env[key];
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

export const appConfig: AppConfig = {
  apiBaseUrl: readEnv("VITE_API_BASE_URL", "http://localhost:8000/api/v1"),
  appName: readEnv("VITE_APP_NAME", "MediVerse AI"),
  appEnv: (readEnv("VITE_APP_ENV", "development") as AppConfig["appEnv"]) ?? "development",
};

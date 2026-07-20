/**
 * Local/session storage key names, centralized to avoid magic strings
 * and key collisions across features.
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "mediverse_access_token",
  REFRESH_TOKEN: "mediverse_refresh_token",
  THEME: "mediverse-ui-theme",
} as const;

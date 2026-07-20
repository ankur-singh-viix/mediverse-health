import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import { appConfig } from "@/config/env";
import { STORAGE_KEYS } from "@/constants/storage-keys";

/**
 * Shared Axios instance for all API calls.
 *
 * Auth token attachment and 401 handling are wired here as structural
 * placeholders; actual token issuance/refresh logic will be added once
 * the authentication module is implemented.
 */
export const apiClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    }
    return Promise.reject(error);
  }
);

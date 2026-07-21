import * as React from "react";

import { fetchCurrentUser, loginRequest, registerRequest } from "@/features/auth/api/auth.api";
import { mapApiUserToUser } from "@/features/auth/utils/map-user";
import type { LoginPayload, RegisterPayload } from "@/features/auth/types/auth.types";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import type { User } from "@/types/user";

/**
 * Auth context.
 *
 * Owns session state: the current user, loading status during the
 * initial session check, and the login/register/logout actions. Tokens
 * are persisted to `localStorage`; the Axios instance (`lib/axios.ts`)
 * attaches the access token to outgoing requests automatically.
 */
interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

function persistTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
}

function clearTokens(): void {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // On mount, attempt to restore the session from a persisted access
  // token by fetching the current user's profile.
  React.useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

    if (!token) {
      setIsLoading(false);
      return;
    }

    fetchCurrentUser()
      .then((apiUser) => setUser(mapApiUserToUser(apiUser)))
      .catch(() => clearTokens())
      .finally(() => setIsLoading(false));
  }, []);

  const login = React.useCallback(async (payload: LoginPayload): Promise<User> => {
    const response = await loginRequest(payload);
    persistTokens(response.access_token, response.refresh_token);
    const nextUser = mapApiUserToUser(response.user);
    setUser(nextUser);
    return nextUser;
  }, []);

  const register = React.useCallback(async (payload: RegisterPayload): Promise<User> => {
    const response = await registerRequest(payload);
    persistTokens(response.access_token, response.refresh_token);
    const nextUser = mapApiUserToUser(response.user);
    setUser(nextUser);
    return nextUser;
  }, []);

  const logout = React.useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

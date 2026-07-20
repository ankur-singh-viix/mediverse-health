import * as React from "react";

import type { User } from "@/types/user";

/**
 * Auth context (structure only).
 *
 * Provides the shape future auth state will take: current user,
 * loading status, and login/logout actions. No real authentication is
 * wired up in Phase 0 - `isAuthenticated` is always `false` and
 * `login`/`logout` are no-ops reserved for a future phase.
 */
interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading] = React.useState(false);

  const login = React.useCallback((nextUser: User) => {
    setUser(nextUser);
  }, []);

  const logout = React.useCallback(() => {
    setUser(null);
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
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

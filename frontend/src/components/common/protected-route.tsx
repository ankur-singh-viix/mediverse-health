import { Navigate, Outlet } from "react-router-dom";

import { PageLoader } from "@/components/common/page-loader";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/providers/auth-provider";
import type { UserRole } from "@/types/user";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

/**
 * Guards nested routes behind authentication (and optionally role
 * membership). Renders the matched child route via `<Outlet />` when
 * access is permitted, otherwise redirects.
 *
 * Phase 0 note: `useAuth` always reports `isAuthenticated: false`
 * since the authentication module is not implemented yet. This
 * component defines the structure that will become functional once
 * login/session logic is built.
 */
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <PageLoader message="Checking your session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <Outlet />;
}

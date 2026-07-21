import { createBrowserRouter } from "react-router-dom";

import { AuthLayout } from "@/components/layout/auth-layout";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PublicLayout } from "@/components/layout/public-layout";
import { ProtectedRoute } from "@/components/common/protected-route";
import { LoginPage } from "@/features/auth/pages/login-page";
import { RegisterPage } from "@/features/auth/pages/register-page";
import { DoctorDashboardPage } from "@/features/doctor/doctor-dashboard-page";
import { PatientDashboardPage } from "@/features/patient/pages/patient-dashboard-page";
import { PatientProfilePage } from "@/features/patient/pages/patient-profile-page";
import { PatientRecordsPage } from "@/features/patient/pages/patient-records-page";
import { LandingPage } from "@/pages/landing-page";
import { NotFoundPage } from "@/pages/not-found-page";

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [{ path: "/", element: <LandingPage /> }],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={["patient"]} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: "/patient/dashboard", element: <PatientDashboardPage /> },
          { path: "/patient/profile", element: <PatientProfilePage /> },
          { path: "/patient/records", element: <PatientRecordsPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={["doctor"]} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [{ path: "/doctor/dashboard", element: <DoctorDashboardPage /> }],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
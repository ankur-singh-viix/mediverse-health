import { FileText, IdCard, LayoutDashboard, Stethoscope, Users } from "lucide-react";
import { NavLink } from "react-router-dom";

import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/providers/auth-provider";

interface SidebarProps {
  open: boolean;
}

const patientNavItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: ROUTES.PATIENT_DASHBOARD },
  { label: "My Profile", icon: IdCard, to: ROUTES.PATIENT_PROFILE },
  { label: "Medical Records", icon: FileText, to: ROUTES.PATIENT_RECORDS },
];

/**
 * Doctor nav items are still placeholders - the doctor module lands
 * in a future phase.
 */
const doctorNavItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Patients", icon: Users },
  { label: "Consultations", icon: Stethoscope },
];

export function Sidebar({ open }: SidebarProps) {
  const { user } = useAuth();
  const isDoctor = user?.role === "doctor";

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 shrink-0 border-r border-border bg-card transition-transform duration-200 md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <nav className="flex h-full flex-col gap-1 p-4">
        {isDoctor
          ? doctorNavItems.map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground opacity-70"
                title="Available in a future phase"
              >
                <Icon className="h-4 w-4" />
                {label}
              </div>
            ))
          : patientNavItems.map(({ label, icon: Icon, to }) => (
              <NavLink
                key={label}
                to={to}
                end
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
      </nav>
    </aside>
  );
}
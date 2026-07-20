import { LayoutDashboard, Stethoscope, Users } from "lucide-react";

import { cn } from "@/lib/utils";

interface SidebarProps {
  open: boolean;
}

/**
 * Sidebar placeholder.
 *
 * Nav items are static placeholders for now; they will be wired to
 * real routes and role-based visibility once patient/doctor feature
 * modules are implemented in later phases.
 */
const navItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Patients", icon: Users },
  { label: "Consultations", icon: Stethoscope },
];

export function Sidebar({ open }: SidebarProps) {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 shrink-0 border-r border-border bg-card transition-transform duration-200 md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <nav className="flex h-full flex-col gap-1 p-4">
        {navItems.map(({ label, icon: Icon }) => (
          <div
            key={label}
            className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground opacity-70"
            title="Available in a future phase"
          >
            <Icon className="h-4 w-4" />
            {label}
          </div>
        ))}
      </nav>
    </aside>
  );
}

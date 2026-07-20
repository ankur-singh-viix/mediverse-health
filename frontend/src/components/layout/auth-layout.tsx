import { Outlet } from "react-router-dom";
import { Stethoscope } from "lucide-react";

import { ThemeToggle } from "@/components/common/theme-toggle";

export function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-between p-6 md:p-10">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 font-semibold">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Stethoscope className="h-5 w-5" />
            </div>
            MediVerse AI
          </a>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-sm">
            <Outlet />
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} MediVerse AI. All rights reserved.
        </p>
      </div>

      <div className="relative hidden bg-primary lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent" />
        <div className="relative flex h-full flex-col items-center justify-center gap-6 p-10 text-primary-foreground">
          <Stethoscope className="h-16 w-16" />
          <div className="max-w-md text-center">
            <h2 className="text-2xl font-semibold">
              A smarter, role-based healthcare experience
            </h2>
            <p className="mt-3 text-sm text-primary-foreground/80">
              MediVerse AI connects patients and doctors on a single,
              secure platform built for clarity, speed, and trust.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

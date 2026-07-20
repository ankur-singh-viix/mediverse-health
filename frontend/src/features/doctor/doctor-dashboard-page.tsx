import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Doctor dashboard placeholder.
 *
 * Intentionally minimal - patient lists, consultations, and clinical
 * tools are out of scope for Phase 0.
 */
export function DoctorDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Doctor dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome to your MediVerse AI dashboard.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>
            Patient lists, consultations, and clinical tools will appear here in a
            future phase.
          </CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  );
}

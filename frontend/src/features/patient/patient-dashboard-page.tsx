import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Patient dashboard placeholder.
 *
 * Intentionally minimal - real dashboard widgets, appointments, and
 * medical timeline features are out of scope for Phase 0.
 */
export function PatientDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Patient dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome to your MediVerse AI dashboard.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>
            Appointments, reports, and your medical timeline will appear here in a
            future phase.
          </CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  );
}

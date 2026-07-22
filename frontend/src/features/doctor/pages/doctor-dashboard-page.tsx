import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { Link } from "react-router-dom";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/components/common/error-state";
import { PageLoader } from "@/components/common/page-loader";
import { fetchPatients } from "@/features/doctor/api/doctor.api";
import { mapApiPatientSummaryToPatientSummary } from "@/features/doctor/utils/map-doctor";
import { useAuth } from "@/providers/auth-provider";

export function DoctorDashboardPage() {
  const { user } = useAuth();

  const {
    data: patients,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["doctor-patients"],
    queryFn: async () => (await fetchPatients()).map(mapApiPatientSummaryToPatientSummary),
  });

  if (isLoading) {
    return <PageLoader message="Loading your patients..." />;
  }

  if (isError) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome back{user ? `, ${user.fullName}` : ""}</h1>
        <p className="text-sm text-muted-foreground">Here's your patient roster.</p>
      </div>

      <Card className="max-w-xs">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total patients</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{patients?.length ?? 0}</div>
          <p className="text-xs text-muted-foreground">Registered on MediVerse AI.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Patients</CardTitle>
          <CardDescription>Select a patient to view their profile and medical records.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {patients && patients.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No patients have registered yet.
            </p>
          )}

          {patients?.map((patient) => (
            <Link
              key={patient.id}
              to={`/doctor/patients/${patient.id}`}
              className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-accent"
            >
              <div>
                <p className="font-medium">{patient.fullName}</p>
                <p className="text-sm text-muted-foreground">{patient.email}</p>
              </div>
              <Badge variant={patient.isActive ? "success" : "secondary"}>
                {patient.isActive ? "Active" : "Inactive"}
              </Badge>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
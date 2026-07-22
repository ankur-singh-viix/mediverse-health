import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, FileText } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/common/error-state";
import { PageLoader } from "@/components/common/page-loader";
import { fetchPatientDetail } from "@/features/doctor/api/doctor.api";
import { mapApiRecordToRecord } from "@/features/patient/utils/map-patient";

const fieldLabel = "text-xs font-medium uppercase tracking-wide text-muted-foreground";

export function DoctorPatientDetailPage() {
  const { patientId } = useParams<{ patientId: string }>();

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["doctor-patient-detail", patientId],
    queryFn: () => fetchPatientDetail(patientId as string),
    enabled: Boolean(patientId),
  });

  if (isLoading) {
    return <PageLoader message="Loading patient record..." />;
  }

  if (isError || !data) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  const { user, profile } = data;
  const records = data.records.map(mapApiRecordToRecord);

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        to="/doctor/dashboard"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to patients
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{user.full_name}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <Badge variant={user.is_active ? "success" : "secondary"}>
          {user.is_active ? "Active" : "Inactive"}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Read-only view of this patient's details.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className={fieldLabel}>Date of birth</p>
            <p className="text-sm">{profile.date_of_birth ?? "—"}</p>
          </div>
          <div>
            <p className={fieldLabel}>Gender</p>
            <p className="text-sm capitalize">{profile.gender ?? "—"}</p>
          </div>
          <div>
            <p className={fieldLabel}>Blood group</p>
            <p className="text-sm">{profile.blood_group ?? "—"}</p>
          </div>
          <div>
            <p className={fieldLabel}>Phone number</p>
            <p className="text-sm">{profile.phone_number ?? "—"}</p>
          </div>
          <div className="sm:col-span-2">
            <p className={fieldLabel}>Address</p>
            <p className="text-sm">{profile.address ?? "—"}</p>
          </div>
          <div>
            <p className={fieldLabel}>Emergency contact</p>
            <p className="text-sm">{profile.emergency_contact_name ?? "—"}</p>
          </div>
          <div>
            <p className={fieldLabel}>Emergency phone</p>
            <p className="text-sm">{profile.emergency_contact_phone ?? "—"}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Medical records</CardTitle>
          <CardDescription>{records.length} entries logged.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {records.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <FileText className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No medical records yet.</p>
            </div>
          )}
          {records.map((record) => (
            <div key={record.id} className="rounded-lg border border-border p-4">
              <p className="font-medium">{record.title}</p>
              <p className="text-xs text-muted-foreground">{record.recordDate}</p>
              {record.description && (
                <p className="mt-2 text-sm text-muted-foreground">{record.description}</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
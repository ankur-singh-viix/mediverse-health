import { useQuery } from "@tanstack/react-query";
import { CalendarClock, FileText, IdCard } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLoader } from "@/components/common/page-loader";
import { fetchMyAppointments } from "@/features/appointments/api/appointment.api";
import { mapApiAppointmentToAppointment } from "@/features/appointments/utils/map-appointment";
import { fetchMyProfile, fetchMyRecords } from "@/features/patient/api/patient.api";
import { mapApiProfileToProfile, mapApiRecordToRecord } from "@/features/patient/utils/map-patient";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/providers/auth-provider";

export function PatientDashboardPage() {
  const { user } = useAuth();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["patient-profile"],
    queryFn: async () => mapApiProfileToProfile(await fetchMyProfile()),
  });

  const { data: records, isLoading: recordsLoading } = useQuery({
    queryKey: ["patient-records"],
    queryFn: async () => (await fetchMyRecords()).map(mapApiRecordToRecord),
  });

  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ["my-appointments"],
    queryFn: async () => (await fetchMyAppointments()).map(mapApiAppointmentToAppointment),
  });

  if (profileLoading || recordsLoading || appointmentsLoading) {
    return <PageLoader message="Loading your dashboard..." />;
  }

  const profileComplete = Boolean(profile?.phoneNumber && profile?.dateOfBirth);
  const upcomingCount = appointments?.filter(
    (a) => a.status === "pending" || a.status === "confirmed"
  ).length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome back{user ? `, ${user.fullName}` : ""}</h1>
        <p className="text-sm text-muted-foreground">Here's a quick look at your health record.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile status</CardTitle>
            <IdCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profileComplete ? "Complete" : "Incomplete"}</div>
            <p className="text-xs text-muted-foreground">
              {profileComplete
                ? "Your profile is up to date."
                : "Add your details for better care."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medical records</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{records?.length ?? 0}</div>
            <p className="text-xs text-muted-foreground">Entries logged so far.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingCount}</div>
            <p className="text-xs text-muted-foreground">Pending or confirmed.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick actions</CardTitle>
          <CardDescription>Manage your profile and medical history.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to={ROUTES.PATIENT_PROFILE}>Update profile</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to={ROUTES.PATIENT_RECORDS}>View medical records</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to={ROUTES.PATIENT_SYMPTOM_CHECKER}>Run AI symptom checker</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to={ROUTES.PATIENT_APPOINTMENTS}>Book an appointment</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
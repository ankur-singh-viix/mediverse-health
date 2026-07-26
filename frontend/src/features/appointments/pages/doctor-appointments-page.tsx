import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Check, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/common/error-state";
import { PageLoader } from "@/components/common/page-loader";
import {
  fetchDoctorAppointments,
  respondToAppointment,
} from "@/features/appointments/api/appointment.api";
import { mapApiAppointmentToAppointment } from "@/features/appointments/utils/map-appointment";
import type { AppointmentStatus } from "@/features/appointments/types/appointment.types";

const statusBadgeVariant: Record<
  AppointmentStatus,
  "secondary" | "success" | "destructive" | "outline"
> = {
  pending: "secondary",
  confirmed: "success",
  declined: "destructive",
  cancelled: "outline",
  completed: "outline",
};

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function DoctorAppointmentsPage() {
  const queryClient = useQueryClient();

  const {
    data: appointments,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["doctor-appointments"],
    queryFn: async () => (await fetchDoctorAppointments()).map(mapApiAppointmentToAppointment),
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "confirmed" | "declined" }) =>
      respondToAppointment(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["doctor-appointments"] }),
  });

  if (isLoading) {
    return <PageLoader message="Loading appointments..." />;
  }

  if (isError) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Appointments</h1>
        <p className="text-sm text-muted-foreground">
          Review and respond to appointment requests from patients.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Requests</CardTitle>
          <CardDescription>{appointments?.length ?? 0} total requests.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {appointments && appointments.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Calendar className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No appointment requests yet.</p>
            </div>
          )}
          {appointments?.map((appointment) => (
            <div key={appointment.id} className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{appointment.patientFullName}</p>
                <Badge variant={statusBadgeVariant[appointment.status]}>
                  {capitalize(appointment.status)}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(appointment.requestedAt).toLocaleString()}
              </p>
              {appointment.reason && (
                <p className="mt-2 text-sm text-muted-foreground">{appointment.reason}</p>
              )}
              {appointment.status === "pending" && (
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      respondMutation.mutate({ id: appointment.id, status: "confirmed" })
                    }
                    disabled={respondMutation.isPending}
                  >
                    <Check className="h-4 w-4" />
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      respondMutation.mutate({ id: appointment.id, status: "declined" })
                    }
                    disabled={respondMutation.isPending}
                  >
                    <X className="h-4 w-4" />
                    Decline
                  </Button>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
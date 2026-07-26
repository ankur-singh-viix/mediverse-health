import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ErrorState } from "@/components/common/error-state";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { PageLoader } from "@/components/common/page-loader";
import {
  cancelAppointment,
  createAppointment,
  fetchAvailableDoctors,
  fetchMyAppointments,
} from "@/features/appointments/api/appointment.api";
import {
  mapApiAppointmentToAppointment,
  mapApiDoctorOptionToDoctorOption,
} from "@/features/appointments/utils/map-appointment";
import type { AppointmentStatus } from "@/features/appointments/types/appointment.types";
import { getApiErrorMessage } from "@/lib/api-error";

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

const bookingSchema = z.object({
  doctorId: z.string().min(1, "Please select a doctor"),
  requestedAt: z.string().min(1, "Please choose a date and time"),
  reason: z.string().max(1000).optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export function PatientAppointmentsPage() {
  const queryClient = useQueryClient();
  const [formError, setFormError] = React.useState<string | null>(null);

  const { data: doctorOptions, isLoading: doctorsLoading } = useQuery({
    queryKey: ["appointment-doctors"],
    queryFn: async () => (await fetchAvailableDoctors()).map(mapApiDoctorOptionToDoctorOption),
  });

  const {
    data: appointments,
    isLoading: appointmentsLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["my-appointments"],
    queryFn: async () => (await fetchMyAppointments()).map(mapApiAppointmentToAppointment),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BookingFormValues>({ resolver: zodResolver(bookingSchema) });

  const bookMutation = useMutation({
    mutationFn: (values: BookingFormValues) =>
      createAppointment({
        doctorId: values.doctorId,
        requestedAt: new Date(values.requestedAt).toISOString(),
        reason: values.reason,
      }),
    onSuccess: () => {
      reset();
      setFormError(null);
      queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
    },
    onError: (error) => setFormError(getApiErrorMessage(error, "Unable to book this appointment.")),
  });

  const cancelMutation = useMutation({
    mutationFn: (appointmentId: string) => cancelAppointment(appointmentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-appointments"] }),
  });

  const onSubmit = (values: BookingFormValues) => {
    setFormError(null);
    bookMutation.mutate(values);
  };

  if (doctorsLoading || appointmentsLoading) {
    return <PageLoader message="Loading appointments..." />;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Appointments</h1>
        <p className="text-sm text-muted-foreground">
          Request a consultation with a doctor and track your requests.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarPlus className="h-4 w-4 text-primary" />
            Request an appointment
          </CardTitle>
          <CardDescription>Pick a doctor and a preferred date and time.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {formError && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {formError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="doctorId">Doctor</Label>
              <select
                id="doctorId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                {...register("doctorId")}
                defaultValue=""
              >
                <option value="" disabled>
                  Select a doctor
                </option>
                {doctorOptions?.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.fullName}
                  </option>
                ))}
              </select>
              {errors.doctorId && (
                <p className="text-sm text-destructive">{errors.doctorId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="requestedAt">Preferred date & time</Label>
              <Input id="requestedAt" type="datetime-local" {...register("requestedAt")} />
              {errors.requestedAt && (
                <p className="text-sm text-destructive">{errors.requestedAt.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason (optional)</Label>
              <Textarea
                id="reason"
                placeholder="Briefly describe why you'd like to see this doctor..."
                {...register("reason")}
              />
            </div>

            <Button type="submit" disabled={bookMutation.isPending}>
              {bookMutation.isPending ? (
                <LoadingSpinner size={16} className="text-primary-foreground" />
              ) : (
                "Request appointment"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My appointments</CardTitle>
          <CardDescription>Track the status of your requests.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isError && <ErrorState onRetry={() => refetch()} />}
          {appointments && appointments.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Clock className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No appointments requested yet.</p>
            </div>
          )}
          {appointments?.map((appointment) => (
            <div key={appointment.id} className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">Dr. {appointment.doctorFullName}</p>
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
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => cancelMutation.mutate(appointment.id)}
                  disabled={cancelMutation.isPending}
                >
                  Cancel request
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
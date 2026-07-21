import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { ErrorState } from "@/components/common/error-state";
import { PageLoader } from "@/components/common/page-loader";
import { fetchMyProfile, updateMyProfile } from "@/features/patient/api/patient.api";
import { mapApiProfileToProfile } from "@/features/patient/utils/map-patient";
import type { Gender } from "@/features/patient/types/patient.types";
import { getApiErrorMessage } from "@/lib/api-error";

const profileSchema = z.object({
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female", "other", ""]).optional(),
  bloodGroup: z.string().max(10).optional(),
  phoneNumber: z.string().max(30).optional(),
  address: z.string().max(500).optional(),
  emergencyContactName: z.string().max(255).optional(),
  emergencyContactPhone: z.string().max(30).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function PatientProfilePage() {
  const queryClient = useQueryClient();
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);

  const {
    data: profile,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["patient-profile"],
    queryFn: async () => mapApiProfileToProfile(await fetchMyProfile()),
  });

  const { register, handleSubmit, reset } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  React.useEffect(() => {
    if (profile) {
      reset({
        dateOfBirth: profile.dateOfBirth ?? "",
        gender: profile.gender ?? "",
        bloodGroup: profile.bloodGroup ?? "",
        phoneNumber: profile.phoneNumber ?? "",
        address: profile.address ?? "",
        emergencyContactName: profile.emergencyContactName ?? "",
        emergencyContactPhone: profile.emergencyContactPhone ?? "",
      });
    }
  }, [profile, reset]);

  const mutation = useMutation({
    mutationFn: (values: ProfileFormValues) =>
      updateMyProfile({
        dateOfBirth: values.dateOfBirth || null,
        gender: (values.gender || null) as Gender | null,
        bloodGroup: values.bloodGroup || null,
        phoneNumber: values.phoneNumber || null,
        address: values.address || null,
        emergencyContactName: values.emergencyContactName || null,
        emergencyContactPhone: values.emergencyContactPhone || null,
      }),
    onSuccess: () => {
      setSuccessMessage("Profile updated successfully.");
      setFormError(null);
      queryClient.invalidateQueries({ queryKey: ["patient-profile"] });
    },
    onError: (error) => {
      setSuccessMessage(null);
      setFormError(getApiErrorMessage(error, "Unable to update your profile."));
    },
  });

  const onSubmit = (values: ProfileFormValues) => {
    setSuccessMessage(null);
    mutation.mutate(values);
  };

  if (isLoading) {
    return <PageLoader message="Loading your profile..." />;
  }

  if (isError) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My profile</h1>
        <p className="text-sm text-muted-foreground">
          Keep your personal and emergency contact details up to date.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile details</CardTitle>
          <CardDescription>This information is only visible to you and your care team.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {formError && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {formError}
              </div>
            )}
            {successMessage && (
              <div className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
                {successMessage}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of birth</Label>
                <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  {...register("gender")}
                >
                  <option value="">Prefer not to say</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bloodGroup">Blood group</Label>
                <Input id="bloodGroup" placeholder="O+" {...register("bloodGroup")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone number</Label>
                <Input id="phoneNumber" placeholder="+1 555 123 4567" {...register("phoneNumber")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" placeholder="123 Main St, City, Country" {...register("address")} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="emergencyContactName">Emergency contact name</Label>
                <Input id="emergencyContactName" {...register("emergencyContactName")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContactPhone">Emergency contact phone</Label>
                <Input id="emergencyContactPhone" {...register("emergencyContactPhone")} />
              </div>
            </div>

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? <LoadingSpinner size={16} className="text-primary-foreground" /> : "Save changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
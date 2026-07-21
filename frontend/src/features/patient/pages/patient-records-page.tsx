import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { FileText, Plus, Trash2 } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ErrorState } from "@/components/common/error-state";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { PageLoader } from "@/components/common/page-loader";
import {
  createMyRecord,
  deleteMyRecord,
  fetchMyRecords,
} from "@/features/patient/api/patient.api";
import { mapApiRecordToRecord } from "@/features/patient/utils/map-patient";
import { getApiErrorMessage } from "@/lib/api-error";

const recordSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(255),
  description: z.string().max(5000).optional(),
  recordDate: z.string().optional(),
});

type RecordFormValues = z.infer<typeof recordSchema>;

export function PatientRecordsPage() {
  const queryClient = useQueryClient();
  const [formError, setFormError] = React.useState<string | null>(null);
  const [showForm, setShowForm] = React.useState(false);

  const {
    data: records,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["patient-records"],
    queryFn: async () => (await fetchMyRecords()).map(mapApiRecordToRecord),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RecordFormValues>({ resolver: zodResolver(recordSchema) });

  const createMutation = useMutation({
    mutationFn: (values: RecordFormValues) => createMyRecord(values),
    onSuccess: () => {
      reset();
      setShowForm(false);
      setFormError(null);
      queryClient.invalidateQueries({ queryKey: ["patient-records"] });
    },
    onError: (error) => setFormError(getApiErrorMessage(error, "Unable to add this record.")),
  });

  const deleteMutation = useMutation({
    mutationFn: (recordId: string) => deleteMyRecord(recordId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["patient-records"] }),
  });

  const onSubmit = (values: RecordFormValues) => {
    setFormError(null);
    createMutation.mutate(values);
  };

  if (isLoading) {
    return <PageLoader message="Loading your medical records..." />;
  }

  if (isError) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Medical records</h1>
          <p className="text-sm text-muted-foreground">
            A simple log of your visits, notes, and history.
          </p>
        </div>
        <Button onClick={() => setShowForm((prev) => !prev)} variant={showForm ? "outline" : "default"}>
          <Plus className="h-4 w-4" />
          {showForm ? "Cancel" : "Add record"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New record</CardTitle>
            <CardDescription>Add a note about a visit, diagnosis, or treatment.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              {formError && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {formError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Annual checkup" {...register("title")} />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="recordDate">Date</Label>
                <Input id="recordDate" type="date" {...register("recordDate")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Notes</Label>
                <Textarea id="description" placeholder="Details about this visit..." {...register("description")} />
              </div>

              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <LoadingSpinner size={16} className="text-primary-foreground" />
                ) : (
                  "Save record"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {records && records.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <FileText className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No medical records yet. Add your first one to get started.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {records?.map((record) => (
          <Card key={record.id}>
            <CardContent className="flex items-start justify-between gap-4 py-5">
              <div>
                <p className="font-medium">{record.title}</p>
                <p className="text-xs text-muted-foreground">{record.recordDate}</p>
                {record.description && (
                  <p className="mt-2 text-sm text-muted-foreground">{record.description}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Delete record"
                onClick={() => deleteMutation.mutate(record.id)}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
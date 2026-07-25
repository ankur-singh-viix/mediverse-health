import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, FileText, NotebookPen, Sparkles } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ErrorState } from "@/components/common/error-state";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { PageLoader } from "@/components/common/page-loader";
import { addPatientNote, fetchPatientDetail } from "@/features/doctor/api/doctor.api";
import { mapApiNoteToNote } from "@/features/doctor/utils/map-doctor";
import { mapApiPredictionToPrediction } from "@/features/ai/utils/map-ai";
import type { RiskLevel } from "@/features/ai/types/ai.types";
import { mapApiRecordToRecord } from "@/features/patient/utils/map-patient";
import { getApiErrorMessage } from "@/lib/api-error";

const fieldLabel = "text-xs font-medium uppercase tracking-wide text-muted-foreground";

const riskBadgeVariant: Record<RiskLevel, "success" | "secondary" | "destructive"> = {
  low: "success",
  medium: "secondary",
  high: "destructive",
};

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function DoctorPatientDetailPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const queryClient = useQueryClient();
  const [noteText, setNoteText] = React.useState("");
  const [noteError, setNoteError] = React.useState<string | null>(null);

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

  const addNoteMutation = useMutation({
    mutationFn: (note: string) => addPatientNote(patientId as string, note),
    onSuccess: () => {
      setNoteText("");
      setNoteError(null);
      queryClient.invalidateQueries({ queryKey: ["doctor-patient-detail", patientId] });
    },
    onError: (error) => setNoteError(getApiErrorMessage(error, "Unable to add this note.")),
  });

  const handleAddNote = () => {
    if (noteText.trim().length < 2) {
      setNoteError("Note must be at least 2 characters.");
      return;
    }
    setNoteError(null);
    addNoteMutation.mutate(noteText.trim());
  };

  if (isLoading) {
    return <PageLoader message="Loading patient record..." />;
  }

  if (isError || !data) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  const { user, profile } = data;
  const records = data.records.map(mapApiRecordToRecord);
  const predictions = data.predictions.map(mapApiPredictionToPrediction);
  const notes = data.notes.map(mapApiNoteToNote);

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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI symptom-check history
          </CardTitle>
          <CardDescription>
            {predictions.length} check{predictions.length === 1 ? "" : "s"} logged by the patient.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {predictions.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              This patient hasn't run a symptom check yet.
            </p>
          )}
          {predictions.map((prediction) => (
            <div key={prediction.id} className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{prediction.predictedCondition}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {Math.round(prediction.confidence * 100)}% confidence
                  </Badge>
                  <Badge variant={riskBadgeVariant[prediction.riskLevel]}>
                    {capitalize(prediction.riskLevel)}
                  </Badge>
                </div>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Reported: {prediction.symptoms}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{prediction.advice}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <NotebookPen className="h-4 w-4 text-primary" />
            Clinical notes
          </CardTitle>
          <CardDescription>Notes you and other doctors have added for this patient.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {noteError && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {noteError}
            </div>
          )}

          <div className="space-y-2">
            <Textarea
              placeholder="Add a clinical note about this patient..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
            <Button onClick={handleAddNote} disabled={addNoteMutation.isPending}>
              {addNoteMutation.isPending ? (
                <LoadingSpinner size={16} className="text-primary-foreground" />
              ) : (
                "Add note"
              )}
            </Button>
          </div>

          <div className="space-y-3">
            {notes.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No clinical notes yet.
              </p>
            )}
            {notes.map((note) => (
              <div key={note.id} className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{note.doctorFullName}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(note.createdAt).toLocaleString()}
                  </p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{note.note}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
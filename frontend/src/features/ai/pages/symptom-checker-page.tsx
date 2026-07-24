import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Cpu, Search, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ErrorState } from "@/components/common/error-state";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { PageLoader } from "@/components/common/page-loader";
import {
  fetchAvailableSymptoms,
  fetchPredictionHistory,
  runSymptomCheck,
} from "@/features/ai/api/ai.api";
import { mapApiPredictionToPrediction, mapApiResultToResult } from "@/features/ai/utils/map-ai";
import type { RiskLevel } from "@/features/ai/types/ai.types";
import { getApiErrorMessage } from "@/lib/api-error";
import { cn } from "@/lib/utils";

function formatSymptom(text: string): string {
  const withSpaces = text.replace(/_/g, " ");
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const riskBadgeVariant: Record<RiskLevel, "success" | "secondary" | "destructive"> = {
  low: "success",
  medium: "secondary",
  high: "destructive",
};

const engineLabel: Record<string, string> = {
  ml_model: "Trained ML model",
  rule_based: "Rule-based fallback",
};

export function SymptomCheckerPage() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = React.useState<string[]>([]);
  const [filter, setFilter] = React.useState("");
  const [formError, setFormError] = React.useState<string | null>(null);

  const { data: symptomOptions, isLoading: symptomsLoading } = useQuery({
    queryKey: ["ai-symptoms"],
    queryFn: fetchAvailableSymptoms,
  });

  const {
    data: history,
    isLoading: historyLoading,
    isError: historyError,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ["prediction-history"],
    queryFn: async () => (await fetchPredictionHistory()).map(mapApiPredictionToPrediction),
  });

  const checkMutation = useMutation({
    mutationFn: (symptoms: string[]) => runSymptomCheck(symptoms),
    onSuccess: () => {
      setFormError(null);
      queryClient.invalidateQueries({ queryKey: ["prediction-history"] });
    },
    onError: (error) => setFormError(getApiErrorMessage(error, "Unable to run this check.")),
  });

  const toggleSymptom = (symptom: string) => {
    setSelected((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const handleSubmit = () => {
    if (selected.length === 0) {
      setFormError("Select at least one symptom.");
      return;
    }
    setFormError(null);
    checkMutation.mutate(selected);
  };

  const result = checkMutation.data ? mapApiResultToResult(checkMutation.data) : null;

  const filteredSymptoms = React.useMemo(() => {
    if (!symptomOptions) return [];
    const query = filter.trim().toLowerCase();
    if (!query) return symptomOptions;
    return symptomOptions.filter((s) => s.replace(/_/g, " ").toLowerCase().includes(query));
  }, [symptomOptions, filter]);

  if (symptomsLoading) {
    return <PageLoader message="Loading symptom checker..." />;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <Sparkles className="h-6 w-6 text-primary" />
          AI Symptom Checker
        </h1>
        <p className="text-sm text-muted-foreground">
          Select what you're experiencing to get a general, informational suggestion from a
          trained machine learning model.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-600 dark:text-amber-400">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          This tool provides general, educational suggestions only and is not a medical
          diagnosis. Always consult a licensed physician for accurate diagnosis and treatment.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What are you experiencing?</CardTitle>
          <CardDescription>
            Select all symptoms that apply. {symptomOptions?.length ?? 0} symptoms recognized.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {formError && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {formError}
            </div>
          )}

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search symptoms (e.g. fever, cough, headache)..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-9"
            />
          </div>

          {selected.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Selected ({selected.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {selected.map((symptom) => (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => toggleSymptom(symptom)}
                    className="rounded-full border border-primary bg-primary px-3 py-1.5 text-sm text-primary-foreground"
                  >
                    {formatSymptom(symptom)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="max-h-64 overflow-y-auto rounded-lg border border-border p-3">
            <div className="flex flex-wrap gap-2">
              {filteredSymptoms
                .filter((s) => !selected.includes(s))
                .map((symptom) => (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => toggleSymptom(symptom)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm transition-colors",
                      "border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    {formatSymptom(symptom)}
                  </button>
                ))}
              {filteredSymptoms.length === 0 && (
                <p className="py-4 text-sm text-muted-foreground">No matching symptoms.</p>
              )}
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={checkMutation.isPending}>
            {checkMutation.isPending ? (
              <LoadingSpinner size={16} className="text-primary-foreground" />
            ) : (
              "Check symptoms"
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle>{result.prediction.predictedCondition}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <Cpu className="h-3 w-3" />
                  {engineLabel[result.engine] ?? result.engine}
                </Badge>
                <Badge variant={riskBadgeVariant[result.prediction.riskLevel]}>
                  {capitalize(result.prediction.riskLevel)} risk
                </Badge>
              </div>
            </div>
            <CardDescription>
              Confidence: {Math.round(result.prediction.confidence * 100)}%
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.round(result.prediction.confidence * 100)}%` }}
              />
            </div>

            {result.matchedSymptoms.length > 0 && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Matched symptoms
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {result.matchedSymptoms.map((symptom) => (
                    <Badge key={symptom} variant="outline">
                      {formatSymptom(symptom)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Suggestion
              </p>
              <p className="mt-1 text-sm">{result.prediction.advice}</p>
            </div>

            <p className="text-xs text-muted-foreground">{result.disclaimer}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>Your past symptom checks.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {historyLoading && <LoadingSpinner size={20} />}
          {historyError && <ErrorState onRetry={() => refetchHistory()} />}
          {history && history.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No symptom checks yet.
            </p>
          )}
          {history?.map((item) => (
            <div key={item.id} className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{item.predictedCondition}</p>
                <Badge variant={riskBadgeVariant[item.riskLevel]}>
                  {capitalize(item.riskLevel)}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.symptoms.split(", ").map(formatSymptom).join(", ")}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
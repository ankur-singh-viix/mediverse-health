import { LoadingSpinner } from "@/components/common/loading-spinner";

interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = "Loading..." }: PageLoaderProps) {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-3">
      <LoadingSpinner size={32} />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

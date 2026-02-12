import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({
  message = "로딩 중...",
}: LoadingSpinnerProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

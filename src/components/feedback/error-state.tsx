import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export function ErrorState({
  className,
  description = "Terjadi kesalahan saat memuat data. Coba lagi.",
  onRetry,
  retryLabel = "Coba lagi",
  title = "Data gagal dimuat",
}: {
  className?: string;
  description?: React.ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  title?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border border-danger/20 bg-danger-subtle p-6 text-center",
        className,
      )}
      role="alert"
    >
      <AlertTriangle
        aria-hidden="true"
        className="h-8 w-8 text-danger-strong"
      />
      <div className="flex max-w-sm flex-col gap-1">
        <h3 className="text-card-title text-foreground">{title}</h3>
        <p className="text-body text-foreground">{description}</p>
      </div>
      {onRetry ? (
        <Button onClick={onRetry} variant="outline">
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}

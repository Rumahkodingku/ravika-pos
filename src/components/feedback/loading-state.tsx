import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

export function LoadingState({
  className,
  message = "Memuat data…",
}: {
  className?: string;
  message?: string;
}) {
  return (
    <output
      aria-live="polite"
      className={cn(
        "flex min-h-40 flex-col items-center justify-center gap-3 p-6 text-center",
        className,
      )}
    >
      <Loader2
        aria-hidden="true"
        className="h-6 w-6 animate-spin text-primary motion-reduce:animate-none"
      />
      <p className="text-body text-muted-foreground">{message}</p>
    </output>
  );
}

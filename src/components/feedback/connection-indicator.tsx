import { cn } from "@/lib/cn";

export type ConnectionStatus = "connected" | "reconnecting" | "disconnected";

const config: Record<
  ConnectionStatus,
  { label: string; dot: string; text: string }
> = {
  connected: {
    label: "Terhubung",
    dot: "bg-success",
    text: "text-success-strong",
  },
  reconnecting: {
    label: "Menyambung ulang",
    dot: "bg-warning",
    text: "text-warning-strong",
  },
  disconnected: {
    label: "Terputus",
    dot: "bg-danger",
    text: "text-danger-strong",
  },
};

export function ConnectionIndicator({
  className,
  status,
}: {
  className?: string;
  status: ConnectionStatus;
}) {
  const item = config[status];

  return (
    <output
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-1.5 text-caption font-medium",
        item.text,
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "h-2 w-2 rounded-full",
          item.dot,
          status === "reconnecting" &&
            "animate-pulse motion-reduce:animate-none",
        )}
      />
      {item.label}
    </output>
  );
}

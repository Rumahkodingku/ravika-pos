import { cn } from "@/lib/cn";
import { paymentStatusConfig, preparationStatusConfig } from "@/lib/status";
import type { PaymentStatus, PreparationStatus, Tone } from "@/types/ui";

const toneClasses: Record<Tone, string> = {
  neutral: "border-border bg-muted text-foreground",
  primary: "border-primary/20 bg-primary/10 text-primary-strong",
  success: "border-success/20 bg-success-subtle text-success-strong",
  warning: "border-warning/20 bg-warning-subtle text-warning-strong",
  danger: "border-danger/20 bg-danger-subtle text-danger-strong",
  info: "border-info/20 bg-info-subtle text-info-strong",
  teal: "border-teal/20 bg-teal-subtle text-teal-strong",
};

export function Badge({
  children,
  className,
  tone = "neutral",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: Tone;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-caption font-medium",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({
  kind,
  status,
}:
  | {
      kind: "payment";
      status: PaymentStatus;
    }
  | {
      kind: "preparation";
      status: PreparationStatus;
    }) {
  const config =
    kind === "payment"
      ? paymentStatusConfig[status]
      : preparationStatusConfig[status];

  return <Badge tone={config.tone}>{config.label}</Badge>;
}

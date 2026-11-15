import { cn } from "@/lib/cn";
import type { PaymentStatus, PreparationStatus, Tone } from "@/types/ui";

const toneClasses: Record<Tone, string> = {
  neutral: "border-border bg-muted text-foreground",
  primary: "border-primary/20 bg-primary/10 text-primary",
  success: "border-success/20 bg-success-subtle text-success",
  warning: "border-warning/20 bg-warning-subtle text-warning",
  danger: "border-danger/20 bg-danger-subtle text-danger",
  info: "border-info/20 bg-info-subtle text-info",
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
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-caption font-medium",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const paymentLabels: Record<PaymentStatus, { label: string; tone: Tone }> = {
  UNPAID: { label: "Belum dibayar", tone: "danger" },
  PARTIALLY_PAID: { label: "Dibayar sebagian", tone: "warning" },
  PAID: { label: "Lunas", tone: "success" },
  REFUNDED: { label: "Dikembalikan", tone: "info" },
};

const preparationLabels: Record<
  PreparationStatus,
  { label: string; tone: Tone }
> = {
  NEW: { label: "Baru", tone: "info" },
  ACCEPTED: { label: "Diterima", tone: "primary" },
  PREPARING: { label: "Disiapkan", tone: "warning" },
  READY: { label: "Siap", tone: "success" },
  COMPLETED: { label: "Selesai", tone: "neutral" },
  CANCELLED: { label: "Dibatalkan", tone: "danger" },
};

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
    kind === "payment" ? paymentLabels[status] : preparationLabels[status];

  return <Badge tone={config.tone}>{config.label}</Badge>;
}

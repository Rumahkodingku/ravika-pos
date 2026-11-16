import type { PaymentStatus, PreparationStatus, Tone } from "@/types/ui";

type StatusConfig = {
  label: string;
  tone: Tone;
};

export const paymentStatusConfig: Record<PaymentStatus, StatusConfig> = {
  UNPAID: { label: "Belum dibayar", tone: "danger" },
  PARTIALLY_PAID: { label: "Dibayar sebagian", tone: "warning" },
  PAID: { label: "Lunas", tone: "success" },
  REFUNDED: { label: "Dikembalikan", tone: "info" },
};

export const preparationStatusConfig: Record<PreparationStatus, StatusConfig> =
  {
    NEW: { label: "Baru", tone: "primary" },
    ACCEPTED: { label: "Diterima", tone: "teal" },
    PREPARING: { label: "Disiapkan", tone: "warning" },
    READY: { label: "Siap", tone: "success" },
    COMPLETED: { label: "Selesai", tone: "neutral" },
    CANCELLED: { label: "Dibatalkan", tone: "danger" },
  };

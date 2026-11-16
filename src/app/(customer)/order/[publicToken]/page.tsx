import { ReceiptText } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ServiceFlow } from "@/components/ui/service-flow";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { ServiceFlowStep } from "@/types/ui";

export const instant = false;

const orderSteps: ServiceFlowStep[] = [
  { id: "accepted", label: "Diterima", state: "complete" },
  { id: "preparing", label: "Disiapkan", state: "current" },
  { id: "ready", label: "Siap", state: "upcoming" },
  { id: "completed", label: "Selesai", state: "upcoming" },
];

export default async function OrderStatusPage({
  params,
}: {
  params: Promise<{ publicToken: string }>;
}) {
  const { publicToken } = await params;

  if (!publicToken) {
    return (
      <EmptyState
        description="Tautan status pesanan tidak valid atau sudah tidak berlaku."
        icon={ReceiptText}
        title="Pesanan tidak ditemukan"
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-page-title text-foreground">Status pesanan</h1>
          <p className="text-body text-muted-foreground">Nomor KMG-0248</p>
          <p className="text-caption text-muted-foreground">
            {formatDateTime("2026-11-15T10:42:00+07:00")}
          </p>
        </div>
        <Badge tone="neutral">Data contoh</Badge>
      </div>

      <Card>
        <CardHeader
          action={<Badge tone="neutral">Dine-in</Badge>}
          description="Status pembayaran dan persiapan ditampilkan terpisah."
          title="Ringkasan pesanan"
        />
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <StatusBadge kind="payment" status="UNPAID" />
            <StatusBadge kind="preparation" status="PREPARING" />
          </div>
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-body text-muted-foreground">Total</span>
            <span className="text-card-title tabular-nums text-foreground">
              {formatCurrency(128000)}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          description="Pesanan diperbarui oleh staf RAVIKA."
          title="Progres pesanan"
        />
        <CardContent>
          <ServiceFlow orientation="vertical" steps={orderSteps} />
        </CardContent>
      </Card>

      <p className="text-caption text-muted-foreground">
        Pembayaran dilakukan di kasir. Halaman ini tidak menampilkan data
        pelanggan lain.
      </p>
    </div>
  );
}

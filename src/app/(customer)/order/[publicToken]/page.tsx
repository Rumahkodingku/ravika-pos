import { ReceiptText } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCurrency, formatDateTime } from "@/lib/format";

export const instant = false;

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
        <div>
          <h1 className="text-page-title text-foreground">Status pesanan</h1>
          <p className="text-body text-muted-foreground">
            Nomor KMG-0248 · {formatDateTime("2026-11-15T10:42:00+07:00")}
          </p>
        </div>
        <Badge tone="info">Fase 3</Badge>
      </div>

      <Card>
        <CardHeader
          action={<Badge tone="neutral">Dine-in</Badge>}
          description="Contoh tampilan status yang aman untuk pelanggan."
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
          <p className="text-caption text-muted-foreground">
            Pembayaran dilakukan di kasir. Status persiapan dan pembayaran
            ditampilkan terpisah.
          </p>
        </CardContent>
      </Card>

      <EmptyState
        description="Pelacakan status real-time dan detail pesanan pelanggan akan diimplementasikan pada Fase 3/5."
        icon={ReceiptText}
        title="Pelacakan belum aktif"
      />
    </div>
  );
}

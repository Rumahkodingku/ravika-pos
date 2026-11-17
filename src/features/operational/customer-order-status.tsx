"use client";

import { ReceiptText } from "lucide-react";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ServiceFlow } from "@/components/ui/service-flow";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { preparationStatusConfig } from "@/lib/status";
import { useManagementStore } from "@/mocks/management/hooks";
import type { PreparationStatus, ServiceFlowStep } from "@/types/ui";

const statusOrder: PreparationStatus[] = [
  "NEW",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "COMPLETED",
];

export function CustomerOrderStatus({ publicToken }: { publicToken: string }) {
  const orders = useManagementStore((state) => state.orders);
  const tables = useManagementStore((state) => state.tables);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const order = mounted
    ? orders.find((candidate) => candidate.publicToken === publicToken)
    : undefined;

  if (!mounted) {
    return <LoadingState message="Memuat status pesanan..." />;
  }

  if (!order) {
    return (
      <EmptyState
        description="Tautan status pesanan tidak valid atau data simulasi sudah dimuat ulang. Minta bantuan staf."
        icon={ReceiptText}
        title="Pesanan tidak ditemukan"
      />
    );
  }

  const table = tables.find((candidate) => candidate.id === order.tableId);
  const currentIndex = statusOrder.indexOf(order.orderStatus);
  const steps: ServiceFlowStep[] =
    order.orderStatus === "CANCELLED"
      ? [
          {
            id: "cancelled",
            label: preparationStatusConfig.CANCELLED.label,
            tone: preparationStatusConfig.CANCELLED.tone,
            state: "cancelled",
          },
        ]
      : statusOrder.map((status, index) => ({
          id: status,
          label: preparationStatusConfig[status].label,
          tone: preparationStatusConfig[status].tone,
          state:
            index < currentIndex
              ? "complete"
              : index === currentIndex
                ? "current"
                : "upcoming",
        }));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-page-title text-foreground">Status pesanan</h1>
          <p className="text-body text-muted-foreground">{order.orderNumber}</p>
          <p className="text-caption text-muted-foreground">
            {formatDateTime(order.createdAt)}
          </p>
        </div>
        <Badge className="shrink-0" tone="neutral">
          Data contoh
        </Badge>
      </div>

      <Card>
        <CardHeader
          action={
            <Badge tone="neutral">
              {order.orderType === "DINE_IN" ? "Dine-in" : "Takeaway"}
            </Badge>
          }
          description={
            table
              ? `${table.name}. Pembayaran dilakukan di kasir.`
              : "Pembayaran dilakukan di kasir."
          }
          title="Ringkasan pesanan"
        />
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <StatusBadge kind="payment" status={order.paymentStatus} />
            <StatusBadge kind="preparation" status={order.orderStatus} />
          </div>
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-body text-muted-foreground">Total</span>
            <span className="text-card-title tabular-nums text-foreground">
              {formatCurrency(order.grandTotal)}
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
          <ServiceFlow orientation="vertical" steps={steps} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Item pesanan" />
        <CardContent className="flex flex-col gap-3">
          {order.items.map((item) => (
            <div
              className="flex items-start justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
              key={item.id}
            >
              <div className="flex min-w-0 flex-col">
                <span className="text-body font-medium text-foreground">
                  {item.quantity} x {item.productName}
                </span>
                {item.variantName ? (
                  <span className="text-caption text-muted-foreground">
                    Varian {item.variantName}
                  </span>
                ) : null}
                {item.addOns.map((addOn) => (
                  <span
                    className="text-caption text-muted-foreground"
                    key={addOn.id}
                  >
                    Add-on {addOn.name}
                  </span>
                ))}
                {item.notes ? (
                  <span className="text-caption text-muted-foreground">
                    Catatan: {item.notes}
                  </span>
                ) : null}
              </div>
              <span className="shrink-0 text-body tabular-nums text-foreground">
                {formatCurrency(item.lineTotal)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="text-caption text-muted-foreground">
        Halaman ini hanya menampilkan pesanan yang cocok dengan tautan Anda.
      </p>
    </div>
  );
}

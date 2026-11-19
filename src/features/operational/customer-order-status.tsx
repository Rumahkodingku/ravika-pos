"use client";

import { ReceiptText } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ServiceFlow } from "@/components/ui/service-flow";
import { usePublicOrderQuery } from "@/features/customer/api";
import { ApiError } from "@/lib/api/errors";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { preparationStatusConfig } from "@/lib/status";
import type { PreparationStatus, ServiceFlowStep } from "@/types/ui";

const statusOrder: PreparationStatus[] = [
  "NEW",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "COMPLETED",
];

export function CustomerOrderStatus({ publicToken }: { publicToken: string }) {
  const {
    data: order,
    error,
    isLoading,
    refetch,
  } = usePublicOrderQuery(publicToken);

  if (isLoading) {
    return <LoadingState message="Memuat status pesanan..." />;
  }

  if (error) {
    if (error instanceof ApiError && error.status === 404) {
      return (
        <EmptyState
          description="Tautan status pesanan tidak valid. Pindai ulang QR di meja atau minta bantuan staf."
          icon={ReceiptText}
          title="Pesanan tidak ditemukan"
        />
      );
    }

    return <ErrorState onRetry={() => void refetch()} />;
  }

  if (!order) {
    return (
      <EmptyState
        description="Tautan status pesanan tidak valid. Pindai ulang QR di meja atau minta bantuan staf."
        icon={ReceiptText}
        title="Pesanan tidak ditemukan"
      />
    );
  }

  const currentIndex = statusOrder.indexOf(order.orderStatus);
  const paymentDescription =
    order.cashTendered !== null
      ? `${order.tableName ? `${order.tableName}. ` : ""}Tunai ${formatCurrency(order.cashTendered)}, kembalian ${formatCurrency(order.cashTendered - order.grandTotal)}.${
          order.paymentStatus === "PAID"
            ? ""
            : " Pembayaran dicatat kasir setelah serah-terima."
        }`
      : order.tableName
        ? `${order.tableName}. Pembayaran dilakukan di kasir.`
        : "Pembayaran dilakukan di kasir.";
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
      </div>

      <Card>
        <CardHeader
          action={
            <Badge tone="neutral">
              {order.tableName ? "Dine-in" : "Takeaway"}
            </Badge>
          }
          description={paymentDescription}
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
          {order.items.map((item, index) => (
            <div
              className="flex items-start justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
              key={`${item.productName}-${index}`}
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
                {item.addOns.map((addOn, addOnIndex) => (
                  <span
                    className="text-caption text-muted-foreground"
                    key={`${addOn.name}-${addOnIndex}`}
                  >
                    Add-on {addOn.name}
                  </span>
                ))}
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

"use client";

import { CheckCircle2 } from "lucide-react";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { formatCurrency } from "@/lib/format";
import { useManagementStore } from "@/mocks/management/hooks";
import type { Order } from "@/types/domain";

export function OrderConfirmation({
  onOpenChange,
  onPay,
  open,
  order,
}: {
  onOpenChange: (open: boolean) => void;
  onPay: (order: Order) => void;
  open: boolean;
  order: Order | null;
}) {
  const tables = useManagementStore((state) => state.tables);
  const table = tables.find((candidate) => candidate.id === order?.tableId);

  return (
    <Drawer
      description="Pesanan sudah masuk antrean KDS."
      footer={
        <>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Buat pesanan baru
          </Button>
          <Button
            onClick={() => {
              if (order) {
                onOpenChange(false);
                onPay(order);
              }
            }}
          >
            Catat pembayaran
          </Button>
        </>
      }
      onOpenChange={onOpenChange}
      open={open && order !== null}
      title="Pesanan berhasil dibuat"
    >
      {order ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-md border border-success/20 bg-success-subtle p-3">
            <CheckCircle2
              aria-hidden="true"
              className="h-5 w-5 shrink-0 text-success-strong"
            />
            <div className="flex flex-col">
              <span className="text-body font-medium text-foreground">
                {order.orderNumber}
              </span>
              <span className="text-caption text-muted-foreground">
                {order.orderType === "DINE_IN"
                  ? `Dine-in, ${table?.name ?? "meja"}`
                  : "Takeaway"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <StatusBadge kind="preparation" status={order.orderStatus} />
            <StatusBadge kind="payment" status={order.paymentStatus} />
            <Badge tone="neutral">
              {order.source === "QR" ? "QR menu" : "Kasir"}
            </Badge>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-body text-muted-foreground">Total</span>
            <span className="text-card-title tabular-nums text-foreground">
              {formatCurrency(order.grandTotal)}
            </span>
          </div>

          <p className="text-caption text-muted-foreground">
            Pembayaran dapat dicatat sekarang atau dari daftar pesanan yang
            perlu dibayar.
          </p>
        </div>
      ) : null}
    </Drawer>
  );
}

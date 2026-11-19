"use client";

import { Wallet } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { usePayableOrdersQuery } from "@/features/operational/api";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { Order } from "@/types/domain";

export function PosPayableOrderDrawer({
  onOpenChange,
  onPay,
  open,
}: {
  onOpenChange: (open: boolean) => void;
  onPay: (order: Order) => void;
  open: boolean;
}) {
  const { data: payableOrders = [] } = usePayableOrdersQuery();

  return (
    <Drawer
      description="Pesanan yang masih memiliki sisa tagihan."
      onOpenChange={onOpenChange}
      open={open}
      title="Pesanan perlu dibayar"
    >
      {payableOrders.length === 0 ? (
        <EmptyState
          description="Belum ada pesanan yang perlu dibayar."
          icon={Wallet}
          title="Tidak ada tagihan"
        />
      ) : (
        <div className="flex flex-col gap-2">
          {payableOrders.map((order) => (
            <div
              className="flex flex-col gap-2 rounded-md border border-border bg-surface p-3"
              key={order.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col">
                  <span className="text-body font-medium text-foreground">
                    {order.orderNumber}
                  </span>
                  <span className="text-caption text-muted-foreground">
                    {order.orderType === "DINE_IN"
                      ? `Dine-in, ${order.tableName ?? "meja"}`
                      : "Takeaway"}
                  </span>
                  <span className="text-caption text-muted-foreground">
                    {formatDateTime(order.createdAt)}
                  </span>
                </div>
                <Badge
                  tone={
                    order.paymentStatus === "PARTIALLY_PAID"
                      ? "warning"
                      : "danger"
                  }
                >
                  {order.paymentStatus === "PARTIALLY_PAID"
                    ? "Dibayar sebagian"
                    : "Belum dibayar"}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-body">
                <span className="text-muted-foreground">
                  {order.createdByName ?? "Tidak ada"}
                </span>
                <span className="tabular-nums text-foreground">
                  Total {formatCurrency(order.grandTotal)}
                </span>
              </div>
              {order.cashTendered !== null ? (
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-body">
                  <span className="text-foreground">
                    Tunai disiapkan {formatCurrency(order.cashTendered)}
                  </span>
                  <span className="tabular-nums text-muted-foreground">
                    Kembalian{" "}
                    {formatCurrency(order.cashTendered - order.grandTotal)}
                  </span>
                </div>
              ) : null}
              <Button
                onClick={() => {
                  onOpenChange(false);
                  onPay(order);
                }}
                size="sm"
                variant="outline"
              >
                Bayar
              </Button>
            </div>
          ))}
        </div>
      )}
    </Drawer>
  );
}

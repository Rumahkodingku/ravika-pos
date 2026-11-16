"use client";

import { Wallet } from "lucide-react";
import { useMemo } from "react";
import { EmptyState } from "@/components/feedback/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { useManagementStore } from "@/mocks/management/hooks";
import type { Order } from "@/types/domain";

export function PosPayableOrderDrawer({
  onOpenChange,
  onPay,
  open,
  outletId,
}: {
  onOpenChange: (open: boolean) => void;
  onPay: (order: Order) => void;
  open: boolean;
  outletId: string;
}) {
  const orders = useManagementStore((state) => state.orders);
  const payments = useManagementStore((state) => state.payments);
  const tables = useManagementStore((state) => state.tables);

  const payableOrders = useMemo(
    () =>
      orders
        .filter(
          (order) =>
            order.outletId === outletId &&
            order.orderStatus !== "CANCELLED" &&
            (order.paymentStatus === "UNPAID" ||
              order.paymentStatus === "PARTIALLY_PAID"),
        )
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    [orders, outletId],
  );

  const paidFor = (orderId: string) =>
    payments
      .filter(
        (payment) =>
          payment.orderId === orderId && payment.status === "RECORDED",
      )
      .reduce((total, payment) => total + payment.amount, 0);

  return (
    <Drawer
      description="Pesanan yang masih memiliki sisa tagihan."
      onOpenChange={onOpenChange}
      open={open}
      title="Pesanan perlu dibayar"
    >
      {payableOrders.length === 0 ? (
        <EmptyState
          description="Belum ada pesanan yang perlu dibayar di outlet ini."
          icon={Wallet}
          title="Tidak ada tagihan"
        />
      ) : (
        <div className="flex flex-col gap-2">
          {payableOrders.map((order) => {
            const paid = paidFor(order.id);
            const remaining = Math.max(0, order.grandTotal - paid);
            const table = tables.find(
              (candidate) => candidate.id === order.tableId,
            );

            return (
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
                        ? `Dine-in, ${table?.name ?? "meja"}`
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
                    Dibayar {formatCurrency(paid)}
                  </span>
                  <span className="text-muted-foreground">
                    Sisa {formatCurrency(remaining)}
                  </span>
                  <span className="tabular-nums text-foreground">
                    Total {formatCurrency(order.grandTotal)}
                  </span>
                </div>
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
            );
          })}
        </div>
      )}
    </Drawer>
  );
}

"use client";

import { Clock3 } from "lucide-react";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import type { Order } from "@/types/domain";
import type { PreparationStatus } from "@/types/ui";

const nextAction: Partial<
  Record<PreparationStatus, { label: string; next: PreparationStatus }>
> = {
  NEW: { label: "Terima", next: "ACCEPTED" },
  ACCEPTED: { label: "Mulai siapkan", next: "PREPARING" },
  PREPARING: { label: "Tandai siap", next: "READY" },
  READY: { label: "Selesai", next: "COMPLETED" },
};

export function OrderTicket({
  elapsed,
  isUpdating = false,
  onAdvance,
  order,
  tableName,
}: {
  elapsed: string;
  isUpdating?: boolean;
  onAdvance: (order: Order) => void;
  order: Order;
  tableName?: string;
}) {
  const action = nextAction[order.orderStatus];

  return (
    <Card variant="order">
      <CardHeader
        action={<StatusBadge kind="preparation" status={order.orderStatus} />}
        className="p-3 sm:p-4"
        description={
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>
              {order.orderType === "DINE_IN"
                ? `Dine-in, ${tableName ?? "meja"}`
                : "Takeaway"}
            </span>
            <span>{formatDateTime(order.createdAt)}</span>
            {order.orderStatus !== "COMPLETED" &&
            order.orderStatus !== "CANCELLED" ? (
              <span className="inline-flex items-center gap-1">
                <Clock3 aria-hidden="true" className="h-3 w-3" />
                {elapsed}
              </span>
            ) : null}
          </span>
        }
        title={order.orderNumber}
      />
      <CardContent className="flex flex-col gap-3 p-3 sm:p-4">
        <div className="flex flex-wrap gap-1.5">
          <StatusBadge kind="payment" status={order.paymentStatus} />
          <Badge tone="neutral">
            {order.source === "QR" ? "QR menu" : "Kasir"}
          </Badge>
        </div>
        <ul className="flex flex-col gap-2">
          {order.items.map((item) => (
            <li
              className="flex items-start justify-between gap-3 text-body"
              key={item.id}
            >
              <span className="flex min-w-0 flex-col">
                <span className="font-medium text-foreground">
                  {item.productName}
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
              </span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                x{item.quantity}
              </span>
            </li>
          ))}
        </ul>
        {order.notes ? (
          <p className="rounded-md border border-border bg-surface-subtle px-2.5 py-2 text-caption text-muted-foreground">
            {order.notes}
          </p>
        ) : null}
        {action ? (
          <Button
            isLoading={isUpdating}
            onClick={() => onAdvance(order)}
            size="sm"
            variant="outline"
          >
            {action.label}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

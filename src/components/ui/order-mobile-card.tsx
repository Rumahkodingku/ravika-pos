import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { PaymentStatus, PreparationStatus } from "@/types/ui";

export function OrderMobileCard({
  order,
}: {
  order: {
    id: string;
    number: string;
    time: string;
    total: number;
    paymentStatus: PaymentStatus;
    preparationStatus: PreparationStatus;
  };
}) {
  return (
    <Card variant="order">
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="text-body font-semibold text-foreground">
              {order.number}
            </p>
            <p className="text-caption text-muted-foreground">
              {formatDateTime(order.time)}
            </p>
          </div>
          <p className="shrink-0 text-body font-medium tabular-nums text-foreground">
            {formatCurrency(order.total)}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <StatusBadge kind="payment" status={order.paymentStatus} />
          <StatusBadge kind="preparation" status={order.preparationStatus} />
        </div>
      </CardContent>
    </Card>
  );
}

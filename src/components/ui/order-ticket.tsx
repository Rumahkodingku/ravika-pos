import { Clock3 } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { MockKdsTicket } from "@/mocks/kds";

export function OrderTicket({ ticket }: { ticket: MockKdsTicket }) {
  return (
    <Card variant="order">
      <CardHeader
        action={<StatusBadge kind="preparation" status={ticket.status} />}
        className="p-3 sm:p-4"
        description={
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>{ticket.orderType}</span>
            {ticket.table ? <span>{ticket.table}</span> : null}
            <span className="inline-flex items-center gap-1">
              <Clock3 aria-hidden="true" className="h-3 w-3" />
              {ticket.elapsed}
            </span>
          </span>
        }
        title={ticket.orderNumber}
      />
      <CardContent className="flex flex-col gap-3 p-3 sm:p-4">
        <ul className="flex flex-col gap-2">
          {ticket.items.map((item) => (
            <li
              className="flex items-start justify-between gap-3 text-body"
              key={`${ticket.id}-${item.name}`}
            >
              <span className="flex min-w-0 flex-col">
                <span className="font-medium text-foreground">{item.name}</span>
                {item.note ? (
                  <span className="text-caption text-muted-foreground">
                    {item.note}
                  </span>
                ) : null}
              </span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                x{item.quantity}
              </span>
            </li>
          ))}
        </ul>
        {ticket.note ? (
          <p className="rounded-md border border-border bg-surface-subtle px-2.5 py-2 text-caption text-muted-foreground">
            {ticket.note}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

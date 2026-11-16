import { ClipboardList } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { OrderTicket } from "@/components/ui/order-ticket";
import { ServiceFlow } from "@/components/ui/service-flow";
import { kdsColumns, mockKdsTickets } from "@/mocks/kds";
import type { ServiceFlowStep } from "@/types/ui";

export default function KdsPage() {
  const activeCount = mockKdsTickets.filter(
    (ticket) => ticket.status !== "COMPLETED",
  ).length;
  const readyCount = mockKdsTickets.filter(
    (ticket) => ticket.status === "READY",
  ).length;

  const firstOpenStatus = kdsColumns.find((column) =>
    mockKdsTickets.some((ticket) => ticket.status === column.status),
  )?.status;

  const flowSteps: ServiceFlowStep[] = kdsColumns.map((column) => ({
    id: column.status,
    label: column.label,
    count: mockKdsTickets.filter((ticket) => ticket.status === column.status)
      .length,
    state: column.status === firstOpenStatus ? "current" : "upcoming",
  }));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-page-title text-foreground">Antrean pesanan</h1>
            <Badge tone="neutral">Data contoh</Badge>
          </div>
          <p className="text-body text-muted-foreground">
            Pantau alur persiapan dan status pesanan aktif.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Card className="p-3 sm:p-4" variant="stat">
          <p className="text-caption text-muted-foreground">Pesanan aktif</p>
          <p className="text-section-title tabular-nums text-foreground sm:text-page-title">
            {activeCount}
          </p>
        </Card>
        <Card className="p-3 sm:p-4" variant="stat">
          <p className="text-caption text-muted-foreground">Siap diambil</p>
          <p className="text-section-title tabular-nums text-foreground sm:text-page-title">
            {readyCount}
          </p>
        </Card>
        <Card className="p-3 sm:p-4" variant="stat">
          <p className="text-caption text-muted-foreground">Rata-rata waktu</p>
          <p className="text-section-title tabular-nums text-foreground sm:text-page-title">
            6 mnt
          </p>
        </Card>
      </div>

      <ServiceFlow steps={flowSteps} />

      <p className="text-caption text-muted-foreground lg:hidden">
        Geser ke samping untuk melihat semua status.
      </p>

      <div className="overflow-x-auto pb-2">
        <div className="grid min-w-[1348px] grid-cols-5 gap-3">
          {kdsColumns.map((column) => {
            const tickets = mockKdsTickets.filter(
              (ticket) => ticket.status === column.status,
            );

            return (
              <section
                className="flex min-h-[420px] min-w-[260px] flex-col gap-3 rounded-lg border border-border bg-surface-subtle p-3"
                key={column.status}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-0.5">
                    <StatusBadge kind="preparation" status={column.status} />
                    <p className="text-caption text-muted-foreground">
                      {column.description}
                    </p>
                  </div>
                  <span className="text-caption tabular-nums text-muted-foreground">
                    {tickets.length}
                  </span>
                </div>
                {tickets.length === 0 ? (
                  <EmptyState
                    className="min-h-0 flex-1 border-0 bg-transparent p-3"
                    description="Belum ada tiket."
                    icon={ClipboardList}
                    title="Kosong"
                  />
                ) : (
                  <div className="flex flex-col gap-2">
                    {tickets.map((ticket) => (
                      <OrderTicket key={ticket.id} ticket={ticket} />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>

      <p className="text-caption text-muted-foreground">
        Aksi perubahan status akan aktif pada Fase 3.
      </p>
    </div>
  );
}

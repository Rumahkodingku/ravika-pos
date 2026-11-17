"use client";

import { ClipboardList } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/feedback/empty-state";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/layout";
import { OrderTicket } from "@/components/ui/order-ticket";
import { OutletSwitcher } from "@/components/ui/outlet-switcher";
import { ServiceFlow } from "@/components/ui/service-flow";
import { useToast } from "@/components/ui/toast";
import { useMockSession } from "@/features/auth/mock-session";
import { RequirePermission } from "@/features/management/permission-gate";
import { useNow } from "@/features/operational/use-now";
import { formatElapsed } from "@/lib/format";
import { preparationStatusConfig } from "@/lib/status";
import { useManagementStore } from "@/mocks/management/hooks";
import { managementService } from "@/mocks/management/service";
import type { Order } from "@/types/domain";
import type { PreparationStatus, ServiceFlowStep } from "@/types/ui";

const columns: Array<{
  status: PreparationStatus;
  label: string;
  description: string;
}> = [
  { status: "NEW", label: "Baru", description: "Perlu diterima" },
  { status: "ACCEPTED", label: "Diterima", description: "Siap diproses" },
  { status: "PREPARING", label: "Disiapkan", description: "Sedang dibuat" },
  { status: "READY", label: "Siap", description: "Menunggu diambil" },
  { status: "COMPLETED", label: "Selesai", description: "Sudah diserahkan" },
];

const nextStatus: Partial<
  Record<PreparationStatus, "ACCEPTED" | "PREPARING" | "READY" | "COMPLETED">
> = {
  NEW: "ACCEPTED",
  ACCEPTED: "PREPARING",
  PREPARING: "READY",
  READY: "COMPLETED",
};

export default function KdsPage() {
  const { toast } = useToast();
  const { user } = useMockSession();
  const outlets = useManagementStore((state) => state.outlets);
  const orders = useManagementStore((state) => state.orders);
  const tables = useManagementStore((state) => state.tables);
  const [selectedOutletId, setSelectedOutletId] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const now = useNow();

  const availableOutlets = outlets.filter(
    (outlet) =>
      outlet.isActive !== false && Boolean(user?.outletIds.includes(outlet.id)),
  );
  const outlet =
    availableOutlets.find((candidate) => candidate.id === selectedOutletId) ??
    availableOutlets[0];

  const activeOrders = useMemo(
    () =>
      outlet
        ? orders
            .filter(
              (order) =>
                order.outletId === outlet.id &&
                ["NEW", "ACCEPTED", "PREPARING", "READY"].includes(
                  order.orderStatus,
                ),
            )
            .sort((left, right) =>
              left.createdAt.localeCompare(right.createdAt),
            )
        : [],
    [orders, outlet],
  );
  const completedOrders = useMemo(
    () =>
      outlet
        ? orders
            .filter(
              (order) =>
                order.outletId === outlet.id &&
                order.orderStatus === "COMPLETED",
            )
            .sort((left, right) =>
              right.updatedAt.localeCompare(left.updatedAt),
            )
            .slice(0, 10)
        : [],
    [orders, outlet],
  );

  const readyCount = activeOrders.filter(
    (order) => order.orderStatus === "READY",
  ).length;
  const averageMinutes =
    now && activeOrders.length > 0
      ? Math.round(
          activeOrders.reduce(
            (total, order) =>
              total +
              Math.max(
                0,
                (now.getTime() - new Date(order.createdAt).getTime()) / 60_000,
              ),
            0,
          ) / activeOrders.length,
        )
      : null;

  const flowSteps: ServiceFlowStep[] = columns.map((column) => {
    const count =
      column.status === "COMPLETED"
        ? completedOrders.length
        : activeOrders.filter((order) => order.orderStatus === column.status)
            .length;

    return {
      id: column.status,
      label: column.label,
      count,
      tone: preparationStatusConfig[column.status].tone,
      state: "active",
    };
  });

  const tableName = (tableId: string | null) =>
    tables.find((table) => table.id === tableId)?.name ?? "meja";

  const advance = async (order: Order) => {
    if (!user) {
      return;
    }

    const next = nextStatus[order.orderStatus];

    if (!next) {
      return;
    }

    setUpdatingId(order.id);
    try {
      await managementService.updateOrderStatus({
        orderId: order.id,
        nextStatus: next,
        actorId: user.id,
      });
      toast({
        title: "Status pesanan diperbarui",
        description: `${order.orderNumber} menjadi ${columns.find((column) => column.status === next)?.label ?? next}.`,
        tone: "success",
      });
    } catch (reason) {
      toast({
        title: "Status gagal diperbarui",
        description: reason instanceof Error ? reason.message : "Coba lagi.",
        tone: "danger",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  if (!outlet) {
    return (
      <EmptyState
        description="Akun ini tidak memiliki outlet aktif untuk KDS."
        title="Outlet tidak tersedia"
      />
    );
  }

  return (
    <RequirePermission permission="kds.view">
      <div className="flex flex-col gap-5">
        <PageHeader
          actions={
            <>
              <Badge tone="neutral">Data contoh</Badge>
              {availableOutlets.length > 1 ? (
                <OutletSwitcher
                  onChange={setSelectedOutletId}
                  outlets={availableOutlets}
                  value={outlet.id}
                />
              ) : (
                <Badge tone="neutral">{outlet.name}</Badge>
              )}
            </>
          }
          description="Pantau alur persiapan dan ubah status pesanan aktif."
          title="Antrean pesanan"
        />

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <Card className="p-3 sm:p-4" variant="stat">
            <p className="text-caption text-muted-foreground">Pesanan aktif</p>
            <p className="text-section-title tabular-nums text-foreground sm:text-page-title">
              {activeOrders.length}
            </p>
          </Card>
          <Card className="p-3 sm:p-4" variant="stat">
            <p className="text-caption text-muted-foreground">Siap diambil</p>
            <p className="text-section-title tabular-nums text-foreground sm:text-page-title">
              {readyCount}
            </p>
          </Card>
          <Card className="p-3 sm:p-4" variant="stat">
            <p className="text-caption text-muted-foreground">
              Rata-rata waktu
            </p>
            <p className="text-section-title tabular-nums text-foreground sm:text-page-title">
              {averageMinutes === null ? "Tidak ada" : `${averageMinutes} mnt`}
            </p>
          </Card>
        </div>

        <ServiceFlow steps={flowSteps} />

        <p className="text-caption text-muted-foreground 2xl:hidden">
          Geser ke samping untuk melihat semua status.
        </p>

        <div className="overflow-x-auto pb-2">
          <div className="grid min-w-[1348px] grid-cols-5 gap-3">
            {columns.map((column) => {
              const tickets =
                column.status === "COMPLETED"
                  ? completedOrders
                  : activeOrders.filter(
                      (order) => order.orderStatus === column.status,
                    );

              return (
                <section
                  aria-label={column.label}
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
                        <OrderTicket
                          elapsed={
                            now
                              ? formatElapsed(ticket.createdAt, now)
                              : "Menghitung..."
                          }
                          isUpdating={updatingId === ticket.id}
                          key={ticket.id}
                          onAdvance={advance}
                          order={ticket}
                          tableName={tableName(ticket.tableId)}
                        />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </div>

        <p className="text-caption text-muted-foreground">
          Sinkronisasi mock antar tab. Tidak ada SSE nyata.
        </p>
      </div>
    </RequirePermission>
  );
}

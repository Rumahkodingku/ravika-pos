"use client";

import { Armchair } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/feedback/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { useManagementStore } from "@/mocks/management/hooks";

export function TableSelector({
  onChange,
  outletId,
  value,
}: {
  onChange: (tableId: string | null) => void;
  outletId: string;
  value: string | null;
}) {
  const tables = useManagementStore((state) => state.tables);
  const orders = useManagementStore((state) => state.orders);
  const [open, setOpen] = useState(false);

  const availableTables = useMemo(
    () =>
      tables
        .filter(
          (table) =>
            table.outletId === outletId &&
            table.isActive &&
            table.status !== "INACTIVE",
        )
        .sort((left, right) => left.name.localeCompare(right.name)),
    [outletId, tables],
  );
  const selected = availableTables.find((table) => table.id === value) ?? null;

  return (
    <>
      <Button
        className="w-full justify-between"
        onClick={() => setOpen(true)}
        variant="outline"
      >
        <span className="flex items-center gap-2">
          <Armchair aria-hidden="true" className="h-4 w-4" />
          {selected?.name ?? "Pilih meja"}
        </span>
        <span className="text-caption text-muted-foreground">
          {selected
            ? selected.status === "OCCUPIED"
              ? "Terisi"
              : "Tersedia"
            : "Dine-in"}
        </span>
      </Button>

      <Drawer
        description="Meja tersedia dan meja yang masih memiliki pesanan aktif."
        onOpenChange={setOpen}
        open={open}
        side="bottom"
        title="Pilih meja"
      >
        {availableTables.length === 0 ? (
          <EmptyState
            description="Belum ada meja aktif di outlet ini."
            icon={Armchair}
            title="Meja tidak tersedia"
          />
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {availableTables.map((table) => {
              const activeCount = orders.filter(
                (order) =>
                  order.tableId === table.id &&
                  ["NEW", "ACCEPTED", "PREPARING", "READY"].includes(
                    order.orderStatus,
                  ),
              ).length;

              return (
                <button
                  aria-pressed={value === table.id}
                  className="flex min-h-11 items-center justify-between gap-3 rounded-md border border-border bg-surface p-3 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                  key={table.id}
                  onClick={() => {
                    onChange(table.id);
                    setOpen(false);
                  }}
                  type="button"
                >
                  <span className="flex flex-col">
                    <span className="text-body font-medium text-foreground">
                      {table.name}
                    </span>
                    <span className="text-caption text-muted-foreground">
                      {activeCount > 0
                        ? `${activeCount} pesanan aktif`
                        : "Belum ada pesanan aktif"}
                    </span>
                  </span>
                  <Badge
                    tone={table.status === "OCCUPIED" ? "warning" : "success"}
                  >
                    {table.status === "OCCUPIED" ? "Terisi" : "Tersedia"}
                  </Badge>
                </button>
              );
            })}
          </div>
        )}
      </Drawer>
    </>
  );
}

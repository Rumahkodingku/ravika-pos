"use client";

import { Armchair } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/feedback/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { useTablesQuery } from "@/features/management/api/tables";

function useAvailableTables() {
  const { data } = useTablesQuery({ pageSize: 100 });

  return useMemo(
    () =>
      (data?.items ?? [])
        .filter((table) => table.isActive && table.status !== "INACTIVE")
        .sort((left, right) => left.name.localeCompare(right.name)),
    [data],
  );
}

export function TablePickerDrawer({
  onChange,
  onOpenChange,
  open,
  value,
}: {
  onChange: (tableId: string | null) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  value: string | null;
}) {
  const availableTables = useAvailableTables();

  return (
    <Drawer
      description="Meja tersedia dan meja yang masih memiliki pesanan aktif."
      onOpenChange={onOpenChange}
      open={open}
      side="bottom"
      title="Pilih meja"
    >
      {availableTables.length === 0 ? (
        <EmptyState
          description="Belum ada meja aktif."
          icon={Armchair}
          title="Meja tidak tersedia"
        />
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {availableTables.map((table) => (
            <button
              aria-pressed={value === table.id}
              className="flex min-h-11 items-center justify-between gap-3 rounded-md border border-border bg-surface p-3 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
              key={table.id}
              onClick={() => {
                onChange(table.id);
                onOpenChange(false);
              }}
              type="button"
            >
              <span className="flex flex-col">
                <span className="text-body font-medium text-foreground">
                  {table.name}
                </span>
                <span className="text-caption text-muted-foreground">
                  {table.activeOrderCount > 0
                    ? `${table.activeOrderCount} pesanan aktif`
                    : "Belum ada pesanan aktif"}
                </span>
              </span>
              <Badge tone={table.status === "OCCUPIED" ? "warning" : "success"}>
                {table.status === "OCCUPIED" ? "Terisi" : "Tersedia"}
              </Badge>
            </button>
          ))}
        </div>
      )}
    </Drawer>
  );
}

export function TableSelector({
  onChange,
  value,
}: {
  onChange: (tableId: string | null) => void;
  value: string | null;
}) {
  const availableTables = useAvailableTables();
  const [open, setOpen] = useState(false);
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

      <TablePickerDrawer
        onChange={onChange}
        onOpenChange={setOpen}
        open={open}
        value={value}
      />
    </>
  );
}

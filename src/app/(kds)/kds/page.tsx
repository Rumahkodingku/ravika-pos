import { ClipboardList } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { StatusBadge } from "@/components/ui/badge";
import type { PreparationStatus } from "@/types/ui";

const columns: Array<{ label: string; status: PreparationStatus }> = [
  { label: "Baru", status: "NEW" },
  { label: "Diterima", status: "ACCEPTED" },
  { label: "Disiapkan", status: "PREPARING" },
  { label: "Siap", status: "READY" },
  { label: "Selesai", status: "COMPLETED" },
];

export default function KdsPage() {
  return (
    <div className="flex min-w-[980px] flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-page-title text-foreground">Antrean pesanan</h1>
          <p className="text-body text-muted-foreground">
            Board KDS dengan data mock. Perubahan status akan aktif pada Fase 3.
          </p>
        </div>
        <StatusBadge kind="preparation" status="READY" />
      </div>
      <div className="grid grid-cols-5 gap-3">
        {columns.map((column) => (
          <section
            className="flex min-h-[420px] flex-col gap-3 rounded-lg border border-border bg-surface-subtle p-3"
            key={column.status}
          >
            <div className="flex items-center justify-between gap-2">
              <StatusBadge kind="preparation" status={column.status} />
              <span className="text-caption tabular-nums text-muted-foreground">
                0
              </span>
            </div>
            <EmptyState
              className="min-h-0 flex-1 border-0 bg-transparent p-3"
              description="Belum ada tiket."
              icon={ClipboardList}
              title="Kosong"
            />
          </section>
        ))}
      </div>
    </div>
  );
}

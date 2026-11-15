import { PackageSearch } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/layout";
import { Skeleton } from "@/components/ui/skeleton";

export default function PosPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        actions={<Badge tone="info">Fase 3</Badge>}
        description="Area pemilihan produk dan keranjang. Katalog POS akan diisi pada Fase 3."
        title="POS"
      />
      <div className="max-w-xl">
        <SearchInput aria-label="Cari produk" placeholder="Cari produk…" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => `pos-skeleton-${index}`).map(
          (key) => (
            <div
              className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4"
              key={key}
            >
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ),
        )}
      </div>
      <EmptyState
        description="Grid produk, varian, add-on, dan interaksi keranjang akan diimplementasikan pada Fase 3."
        icon={PackageSearch}
        title="Katalog POS belum aktif"
      />
    </div>
  );
}

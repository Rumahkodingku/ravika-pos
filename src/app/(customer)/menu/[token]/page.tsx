import { UtensilsCrossed } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export const instant = false;

export default async function MenuPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  if (!token) {
    return (
      <EmptyState
        description="Token QR tidak valid atau sudah tidak berlaku. Pindai ulang QR di meja."
        icon={UtensilsCrossed}
        title="QR tidak valid"
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-page-title text-foreground">Menu</h1>
          <p className="text-body text-muted-foreground">
            Dine-in · Meja contoh
          </p>
        </div>
        <Badge tone="info">Fase 3</Badge>
      </div>

      <SearchInput aria-label="Cari menu" placeholder="Cari menu…" />

      <div className="flex flex-wrap gap-2">
        <Button className="h-11" size="sm">
          Semua
        </Button>
        <Button className="h-11" size="sm" variant="outline">
          Kopi
        </Button>
        <Button className="h-11" size="sm" variant="outline">
          Non-kopi
        </Button>
        <Button className="h-11" size="sm" variant="outline">
          Makanan
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }, (_, index) => `menu-skeleton-${index}`).map(
          (key) => (
            <div
              className="flex flex-col gap-2 rounded-lg border border-border bg-background p-3"
              key={key}
            >
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ),
        )}
      </div>

      <EmptyState
        description="Daftar produk, detail varian, add-on, dan keranjang pelanggan akan diimplementasikan pada Fase 3."
        icon={UtensilsCrossed}
        title="Menu pelanggan belum aktif"
      />
    </div>
  );
}

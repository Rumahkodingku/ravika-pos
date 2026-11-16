"use client";

import { Package, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/types/domain";

export function ProductCard({
  categoryName,
  onAdd,
  product,
}: {
  categoryName?: string;
  onAdd?: (product: Product) => void;
  product: Product;
}) {
  const available = product.isActive && product.isAvailable;
  const hasVariants = product.variants.some((variant) => variant.isActive);

  return (
    <Card className="flex flex-col" variant="product">
      <div className="relative flex aspect-[4/3] items-center justify-center border-b border-border bg-surface-subtle">
        <Package
          aria-hidden="true"
          className="h-10 w-10 text-muted-foreground"
        />
        <Badge
          className="absolute left-2.5 top-2.5"
          tone={available ? "success" : "neutral"}
        >
          {available ? "Tersedia" : "Habis"}
        </Badge>
      </div>
      <CardContent className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 className="truncate text-body font-medium text-foreground">
            {product.name}
          </h3>
          {categoryName ? (
            <p className="truncate text-caption text-muted-foreground">
              {categoryName}
            </p>
          ) : null}
          <p className="text-card-title tabular-nums text-foreground">
            {hasVariants ? "Mulai " : ""}
            {formatCurrency(product.basePrice)}
          </p>
        </div>
        <Button
          aria-label={
            available ? `Tambah ${product.name}` : `${product.name} habis`
          }
          className="mt-auto w-full"
          disabled={!available || !onAdd}
          onClick={() => onAdd?.(product)}
          size="md"
          variant="outline"
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
          {available ? "Tambah" : "Habis"}
        </Button>
      </CardContent>
    </Card>
  );
}

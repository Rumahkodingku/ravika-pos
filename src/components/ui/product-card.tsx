"use client";

import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { MockProduct } from "@/mocks/catalog";

export function ProductCard({
  onAdd,
  product,
}: {
  onAdd?: (product: MockProduct) => void;
  product: MockProduct;
}) {
  const Icon = product.icon;

  return (
    <Card className="flex flex-col" variant="product">
      <div className="relative flex aspect-[4/3] items-center justify-center border-b border-border bg-surface-subtle">
        <Icon aria-hidden="true" className="h-10 w-10 text-muted-foreground" />
        <Badge
          className="absolute left-2.5 top-2.5"
          tone={product.available ? "success" : "neutral"}
        >
          {product.available ? "Tersedia" : "Habis"}
        </Badge>
      </div>
      <CardContent className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 className="truncate text-body font-medium text-foreground">
            {product.name}
          </h3>
          <p className="text-card-title tabular-nums text-foreground">
            {formatCurrency(product.price)}
          </p>
        </div>
        <Button
          aria-label={
            product.available
              ? `Tambah ${product.name}`
              : `${product.name} habis`
          }
          className="mt-auto w-full"
          disabled={!product.available || !onAdd}
          onClick={() => onAdd?.(product)}
          size="md"
          variant="outline"
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
          {product.available ? "Tambah" : "Habis"}
        </Button>
      </CardContent>
    </Card>
  );
}

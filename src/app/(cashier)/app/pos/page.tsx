"use client";

import { PackageSearch } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/feedback/empty-state";
import { usePosCart } from "@/components/shells/pos-cart-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/layout";
import { ProductCard } from "@/components/ui/product-card";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/format";
import {
  type MockProduct,
  menuCategories,
  mockProducts,
} from "@/mocks/catalog";

export default function PosPage() {
  const { addProduct } = usePosCart();
  const { toast } = useToast();
  const [category, setCategory] = useState<string>("Semua");
  const [query, setQuery] = useState("");

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return mockProducts.filter((product) => {
      const matchesCategory =
        category === "Semua" || product.category === category;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        product.name.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  const handleAdd = (product: MockProduct) => {
    addProduct(product);
    toast({
      title: "Ditambahkan ke keranjang",
      description: `${product.name}, ${formatCurrency(product.price)}`,
      tone: "success",
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        actions={<Badge tone="neutral">Data contoh</Badge>}
        description="Pilih produk, atur pesanan, lalu lanjutkan ke pembayaran."
        title="POS"
      />

      <div className="flex gap-4">
        <aside className="hidden w-48 shrink-0 flex-col gap-1 lg:flex">
          <p className="px-2 pb-1 text-caption font-medium text-muted-foreground">
            Kategori
          </p>
          {menuCategories.map((item) => (
            <Button
              aria-pressed={category === item}
              className="h-11 justify-start"
              key={item}
              onClick={() => setCategory(item)}
              size="sm"
              variant={category === item ? "secondary" : "ghost"}
            >
              {item}
            </Button>
          ))}
        </aside>

        <section className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="max-w-xl">
            <SearchInput
              aria-label="Cari produk"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari produk..."
              value={query}
            />
          </div>

          <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 lg:hidden">
            {menuCategories.map((item) => (
              <Button
                aria-pressed={category === item}
                className="h-11 shrink-0"
                key={item}
                onClick={() => setCategory(item)}
                size="sm"
                variant={category === item ? "secondary" : "outline"}
              >
                {item}
              </Button>
            ))}
          </div>

          {filteredProducts.length === 0 ? (
            <EmptyState
              description="Coba kata kunci lain atau pilih kategori yang berbeda."
              icon={PackageSearch}
              title="Produk tidak ditemukan"
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  onAdd={handleAdd}
                  product={product}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

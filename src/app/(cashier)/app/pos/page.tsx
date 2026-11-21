"use client";

import { PackageSearch } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/feedback/empty-state";
import { usePosCart } from "@/components/shells/pos-cart-context";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/layout";
import { ProductCard } from "@/components/ui/product-card";
import { useToast } from "@/components/ui/toast";
import { usePosCatalogQuery } from "@/features/operational/api";
import {
  ProductConfigurator,
  type ProductConfiguratorResult,
} from "@/features/operational/product-configurator";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/types/domain";

export default function PosPage() {
  const { addLine } = usePosCart();
  const { toast } = useToast();
  const { addOns, categories, isLoading, products } = usePosCatalogQuery();
  const [category, setCategory] = useState("Semua");
  const [query, setQuery] = useState("");
  const [configProduct, setConfigProduct] = useState<Product | null>(null);

  const activeCategories = useMemo(
    () =>
      categories
        .filter((item) => item.isActive)
        .sort((left, right) => left.sortOrder - right.sortOrder),
    [categories],
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      if (!product.isActive) {
        return false;
      }

      const categoryName =
        categories.find((item) => item.id === product.categoryId)?.name ??
        "Tanpa kategori";
      const matchesCategory = category === "Semua" || categoryName === category;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        product.name.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [categories, category, products, query]);

  const categoryName = (categoryId: string) =>
    categories.find((item) => item.id === categoryId)?.name ?? "Tanpa kategori";

  const addProduct = (product: Product) => {
    const needsConfigurator =
      product.variants.some((variant) => variant.isActive) ||
      product.addOns.length > 0;

    if (needsConfigurator) {
      setConfigProduct(product);
      return;
    }

    addLine({
      productId: product.id,
      variantId: null,
      addOnIds: [],
      quantity: 1,
      notes: "",
    });
    toast({
      title: "Ditambahkan ke keranjang",
      description: `${product.name}, ${formatCurrency(product.basePrice)}`,
      tone: "success",
    });
  };

  const addConfigured = (input: ProductConfiguratorResult) => {
    addLine(input);
    toast({
      title: "Ditambahkan ke keranjang",
      description: `${configProduct?.name ?? "Produk"} masuk keranjang.`,
      tone: "success",
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        description="Pilih produk, atur pesanan, lalu lanjutkan ke pembayaran."
        title="POS"
      />

      <div className="flex gap-4">
        <aside className="hidden w-48 shrink-0 flex-col gap-1 lg:flex">
          <p className="px-2 pb-1 text-caption font-medium text-muted-foreground">
            Kategori
          </p>
          {["Semua", ...activeCategories.map((item) => item.name)].map(
            (item) => (
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
            ),
          )}
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

          <div className="flex flex-wrap gap-1.5 lg:hidden">
            {["Semua", ...activeCategories.map((item) => item.name)].map(
              (item) => (
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
              ),
            )}
          </div>

          {isLoading ? (
            <p className="text-body text-muted-foreground">Memuat katalog...</p>
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              description="Coba kata kunci lain atau pilih kategori yang berbeda."
              icon={PackageSearch}
              title="Produk tidak ditemukan"
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard
                  categoryName={categoryName(product.categoryId)}
                  key={product.id}
                  onAdd={addProduct}
                  product={product}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <ProductConfigurator
        addOns={addOns}
        onOpenChange={(open) => {
          if (!open) {
            setConfigProduct(null);
          }
        }}
        onSubmit={addConfigured}
        open={configProduct !== null}
        product={configProduct}
      />
    </div>
  );
}

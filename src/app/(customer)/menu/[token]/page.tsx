"use client";

import { ShoppingBag, UtensilsCrossed } from "lucide-react";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/feedback/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { SearchInput } from "@/components/ui/input";
import { ProductCard } from "@/components/ui/product-card";
import { QuantityControl } from "@/components/ui/quantity-control";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/format";
import {
  type MockCartItem,
  type MockProduct,
  menuCategories,
  mockProducts,
} from "@/mocks/catalog";

export default function MenuPage() {
  const params = useParams<{ token: string }>();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("Semua");
  const [cart, setCart] = useState<MockCartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const token = params.token;

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

  const cartLines = useMemo(
    () =>
      cart.flatMap((item) => {
        const product = mockProducts.find(
          (candidate) => candidate.id === item.productId,
        );

        return product ? [{ ...item, product }] : [];
      }),
    [cart],
  );

  const itemCount = cartLines.reduce((total, line) => total + line.quantity, 0);
  const subtotal = cartLines.reduce(
    (total, line) => total + line.product.price * line.quantity,
    0,
  );

  const addProduct = (product: MockProduct) => {
    setCart((current) => {
      const existing = current.find((item) => item.productId === product.id);

      if (existing) {
        return current.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...current, { productId: product.id, quantity: 1 }];
    });

    toast({
      title: "Ditambahkan ke keranjang",
      description: `${product.name}, ${formatCurrency(product.price)}`,
      tone: "success",
    });
  };

  const setQuantity = (productId: string, quantity: number) => {
    setCart((current) =>
      current.map((item) =>
        item.productId === productId ? { ...item, quantity } : item,
      ),
    );
  };

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
    <div className="flex flex-col gap-5 pb-24">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-page-title text-foreground">Menu</h1>
          <p className="text-body text-muted-foreground">
            Dine-in, Meja contoh
          </p>
        </div>
        <Badge tone="neutral">Data contoh</Badge>
      </div>

      <SearchInput
        aria-label="Cari menu"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Cari menu..."
        value={query}
      />

      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
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
          icon={UtensilsCrossed}
          title="Menu tidak ditemukan"
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              onAdd={addProduct}
              product={product}
            />
          ))}
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-[var(--z-sticky)] border-t border-border bg-surface p-3">
        <div className="mx-auto flex max-w-[480px] items-center justify-between gap-3">
          <div className="flex min-w-0 flex-col">
            <span className="text-caption text-muted-foreground">
              {itemCount} item
            </span>
            <span className="truncate text-body font-semibold tabular-nums text-foreground">
              {formatCurrency(subtotal)}
            </span>
          </div>
          <Button onClick={() => setCartOpen(true)} size="md">
            <ShoppingBag aria-hidden="true" className="h-4 w-4" />
            Lihat keranjang
          </Button>
        </div>
      </div>

      <Drawer
        footer={
          <Button className="w-full" disabled>
            Checkout aktif di Fase 3
          </Button>
        }
        onOpenChange={setCartOpen}
        open={cartOpen}
        side="bottom"
        title="Keranjang"
      >
        {cartLines.length === 0 ? (
          <EmptyState
            description="Pilih menu untuk mulai membuat pesanan."
            icon={ShoppingBag}
            title="Keranjang masih kosong"
          />
        ) : (
          <div className="flex flex-col gap-3">
            {cartLines.map((line) => (
              <div
                className="flex flex-col gap-2 rounded-md border border-border bg-surface p-3"
                key={line.product.id}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-body font-medium text-foreground">
                      {line.product.name}
                    </span>
                    <span className="text-caption text-muted-foreground">
                      {formatCurrency(line.product.price)}
                    </span>
                  </div>
                  <span className="shrink-0 text-body font-medium tabular-nums text-foreground">
                    {formatCurrency(line.product.price * line.quantity)}
                  </span>
                </div>
                <QuantityControl
                  onChange={(quantity) =>
                    setQuantity(line.product.id, quantity)
                  }
                  value={line.quantity}
                />
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-border pt-3 text-card-title text-foreground">
              <span>Total</span>
              <span className="tabular-nums">{formatCurrency(subtotal)}</span>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

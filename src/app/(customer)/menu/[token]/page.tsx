"use client";

import { ShoppingBag, Trash2, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Drawer } from "@/components/ui/drawer";
import { Field } from "@/components/ui/field";
import { Input, SearchInput } from "@/components/ui/input";
import { ProductCard } from "@/components/ui/product-card";
import { QuantityControl } from "@/components/ui/quantity-control";
import { useToast } from "@/components/ui/toast";
import {
  type PublicOrderCreated,
  useCreatePublicOrderMutation,
  usePublicMenuQuery,
} from "@/features/customer/api";
import {
  ProductConfigurator,
  type ProductConfiguratorResult,
} from "@/features/operational/product-configurator";
import { ApiError } from "@/lib/api/errors";
import { productPriceDisplay } from "@/lib/catalog-pricing";
import { formatCurrency, parseCurrencyInput } from "@/lib/format";
import type { AddOn, Product } from "@/types/domain";

type PaymentChoice = "CASH" | "COUNTER";

type CustomerCartItem = {
  key: string;
  productId: string;
  variantId: string | null;
  addOnIds: string[];
  quantity: number;
  notes: string;
};

function lineKey(input: Omit<CustomerCartItem, "key">) {
  return [
    input.productId,
    input.variantId ?? "",
    [...input.addOnIds].sort().join(","),
    input.notes.trim(),
  ].join(":");
}

export default function MenuPage() {
  const params = useParams<{ token: string }>();
  const token = params.token ?? "";
  const { toast } = useToast();
  const { data: menu, error, isLoading, refetch } = usePublicMenuQuery(token);
  const createOrder = useCreatePublicOrderMutation();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");
  const [cart, setCart] = useState<CustomerCartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [paymentChoice, setPaymentChoice] = useState<PaymentChoice | null>(
    null,
  );
  const [cashInput, setCashInput] = useState("");
  const [configProduct, setConfigProduct] = useState<Product | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<PublicOrderCreated | null>(
    null,
  );

  const categories = menu?.categories ?? [];
  const addOns = menu?.addOns ?? [];
  const products = useMemo<Product[]>(
    () =>
      (menu?.products ?? []).map((product) => ({
        ...product,
        businessId: "",
        isAvailable: true,
        isActive: true,
        createdAt: "",
        updatedAt: "",
      })),
    [menu?.products],
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
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

  const lines = useMemo(
    () =>
      cart.flatMap((item) => {
        const product = products.find(
          (candidate) => candidate.id === item.productId,
        );

        if (!product) {
          return [];
        }

        const variant = item.variantId
          ? (product.variants.find(
              (candidate) =>
                candidate.id === item.variantId && candidate.isActive,
            ) ?? null)
          : null;

        if (product.variants.length > 0 && !variant) {
          return [];
        }

        if (product.variants.length === 0 && item.variantId) {
          return [];
        }

        const selectedAddOns = item.addOnIds
          .map((addOnId) =>
            addOns.find((candidate) => candidate.id === addOnId),
          )
          .filter((addOn): addOn is AddOn => Boolean(addOn));
        const baseUnitPrice = variant?.price ?? product.basePrice;

        if (baseUnitPrice === null) {
          return [];
        }

        const unitPrice =
          baseUnitPrice +
          selectedAddOns.reduce((total, addOn) => total + addOn.price, 0);

        return [
          {
            ...item,
            product,
            variant,
            addOns: selectedAddOns,
            lineTotal: unitPrice * item.quantity,
          },
        ];
      }),
    [addOns, cart, products],
  );

  const itemCount = lines.reduce((total, line) => total + line.quantity, 0);
  const subtotal = lines.reduce((total, line) => total + line.lineTotal, 0);
  const cashTendered =
    paymentChoice === "CASH" ? parseCurrencyInput(cashInput) : null;
  const change = cashTendered !== null ? cashTendered - subtotal : 0;
  const cashValid = paymentChoice !== "CASH" || (cashTendered ?? 0) >= subtotal;
  const canSubmit = paymentChoice !== null && cashValid && lines.length > 0;

  const categoryName = (categoryId: string) =>
    categories.find((item) => item.id === categoryId)?.name ?? "Tanpa kategori";

  const addLine = (input: Omit<CustomerCartItem, "key">) => {
    const key = lineKey(input);

    setCart((current) => {
      const existing = current.find((item) => item.key === key);

      if (existing) {
        return current.map((item) =>
          item.key === key
            ? { ...item, quantity: item.quantity + input.quantity }
            : item,
        );
      }

      return [...current, { ...input, key }];
    });
  };

  const addProduct = (product: Product) => {
    if (
      product.variants.length > 0 &&
      !product.variants.some((variant) => variant.isActive)
    ) {
      return;
    }

    const needsConfigurator =
      product.variants.length > 0 || product.addOns.length > 0;

    if (needsConfigurator) {
      setConfigProduct(product);
      return;
    }

    const display = productPriceDisplay(product);

    addLine({
      productId: product.id,
      variantId: null,
      addOnIds: [],
      quantity: 1,
      notes: "",
    });
    toast({
      title: "Ditambahkan ke keranjang",
      description:
        display.kind === "unavailable"
          ? product.name
          : `${product.name}, ${formatCurrency(display.amount)}`,
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

  const submitOrder = async () => {
    if (!menu || !canSubmit) {
      return;
    }

    setSubmitError(null);

    try {
      const order = await createOrder.mutateAsync({
        tableToken: token,
        notes: "",
        cashTendered: paymentChoice === "CASH" ? cashTendered : null,
        items: lines.map((line) => ({
          productId: line.productId,
          variantId: line.variantId,
          addOnIds: line.addOnIds,
          quantity: line.quantity,
          notes: line.notes,
        })),
      });
      setCart([]);
      setPaymentChoice(null);
      setCashInput("");
      setCartOpen(false);
      setCreatedOrder(order);
      toast({
        title: "Pesanan terkirim",
        description: `${order.orderNumber} masuk antrean KDS.`,
        tone: "success",
      });
    } catch (reason) {
      setSubmitError(
        reason instanceof Error ? reason.message : "Pesanan gagal dikirim.",
      );
    }
  };

  if (isLoading) {
    return <LoadingState message="Memeriksa QR meja..." />;
  }

  if (error) {
    if (error instanceof ApiError && error.status === 404) {
      return (
        <EmptyState
          description="Token QR tidak valid atau meja sudah tidak aktif. Pindai ulang QR di meja atau minta bantuan staf."
          icon={UtensilsCrossed}
          title="QR tidak valid"
        />
      );
    }

    return <ErrorState onRetry={() => void refetch()} />;
  }

  if (!menu) {
    return (
      <EmptyState
        description="Token QR tidak valid atau meja sudah tidak aktif. Pindai ulang QR di meja atau minta bantuan staf."
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
            {menu.business.name}, {menu.table.name}
          </p>
        </div>
      </div>

      <SearchInput
        aria-label="Cari menu"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Cari menu..."
        value={query}
      />

      <div className="flex flex-wrap gap-1.5">
        {["Semua", ...categories.map((item) => item.name)].map((item) => (
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
              categoryName={categoryName(product.categoryId)}
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
        description="Periksa pesanan dan pilih metode pembayaran."
        footer={
          <Button
            className="w-full"
            disabled={!canSubmit}
            isLoading={createOrder.isPending}
            onClick={submitOrder}
          >
            Kirim pesanan
          </Button>
        }
        onOpenChange={setCartOpen}
        open={cartOpen}
        side="bottom"
        title="Keranjang"
      >
        {lines.length === 0 ? (
          <EmptyState
            description="Pilih menu untuk mulai membuat pesanan."
            icon={ShoppingBag}
            title="Keranjang masih kosong"
          />
        ) : (
          <div className="flex flex-col gap-3">
            {lines.map((line) => (
              <div
                className="flex flex-col gap-2 rounded-md border border-border bg-surface p-3"
                key={line.key}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-body font-medium text-foreground">
                      {line.product.name}
                    </span>
                    {line.variant ? (
                      <span className="text-caption text-muted-foreground">
                        Varian {line.variant.name}
                      </span>
                    ) : null}
                    {line.addOns.map((addOn) => (
                      <span
                        className="text-caption text-muted-foreground"
                        key={addOn.id}
                      >
                        Add-on {addOn.name}
                      </span>
                    ))}
                    {line.notes ? (
                      <span className="text-caption text-muted-foreground">
                        Catatan: {line.notes}
                      </span>
                    ) : null}
                  </div>
                  <span className="shrink-0 text-body font-medium tabular-nums text-foreground">
                    {formatCurrency(line.lineTotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <QuantityControl
                    onChange={(quantity) =>
                      setCart((current) =>
                        quantity <= 0
                          ? current.filter((item) => item.key !== line.key)
                          : current.map((item) =>
                              item.key === line.key
                                ? { ...item, quantity }
                                : item,
                            ),
                      )
                    }
                    value={line.quantity}
                  />
                  <Button
                    aria-label={`Hapus ${line.product.name}`}
                    onClick={() =>
                      setCart((current) =>
                        current.filter((item) => item.key !== line.key),
                      )
                    }
                    size="icon"
                    variant="ghost"
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-border pt-3 text-card-title text-foreground">
              <span>Total</span>
              <span className="tabular-nums">{formatCurrency(subtotal)}</span>
            </div>

            <fieldset className="flex flex-col gap-2">
              <legend className="text-label font-medium text-foreground">
                Metode pembayaran
              </legend>
              <label className="flex min-h-11 items-center gap-2 rounded-md border border-border px-3 text-body">
                <input
                  checked={paymentChoice === "CASH"}
                  name="payment-choice"
                  onChange={() => setPaymentChoice("CASH")}
                  type="radio"
                  value="CASH"
                />
                Tunai, siapkan kembalian
              </label>
              <label className="flex min-h-11 items-center gap-2 rounded-md border border-border px-3 text-body">
                <input
                  checked={paymentChoice === "COUNTER"}
                  name="payment-choice"
                  onChange={() => setPaymentChoice("COUNTER")}
                  type="radio"
                  value="COUNTER"
                />
                Bayar di kasir
              </label>
              {paymentChoice === null ? (
                <p className="text-caption text-muted-foreground">
                  Pilih metode pembayaran sebelum mengirim pesanan.
                </p>
              ) : null}
            </fieldset>

            {paymentChoice === "CASH" ? (
              <>
                <Field htmlFor="customer-cash" label="Uang tunai">
                  <Input
                    id="customer-cash"
                    inputMode="numeric"
                    onChange={(event) => setCashInput(event.target.value)}
                    placeholder="Contoh: 55000"
                    type="text"
                    value={cashInput}
                  />
                </Field>
                {cashValid ? (
                  <div className="flex items-center justify-between rounded-md border border-border bg-surface-subtle px-3 py-2 text-body">
                    <span className="text-muted-foreground">Kembalian</span>
                    <span className="font-medium tabular-nums text-foreground">
                      {formatCurrency(change)}
                    </span>
                  </div>
                ) : (
                  <p className="text-caption font-medium text-danger-strong">
                    Nominal kurang{" "}
                    {formatCurrency(subtotal - (cashTendered ?? 0))}.
                  </p>
                )}
              </>
            ) : null}

            {submitError ? (
              <p
                className="rounded-md border border-danger/20 bg-danger-subtle px-3 py-2 text-body text-danger-strong"
                role="alert"
              >
                {submitError}
              </p>
            ) : null}
          </div>
        )}
      </Drawer>

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
        submitLabel="Tambah ke keranjang"
      />

      <Dialog
        description="Tunjukkan nomor pesanan ini kepada staf jika diperlukan."
        footer={
          <Link
            className={buttonVariants({ variant: "primary" })}
            href={createdOrder ? `/order/${createdOrder.publicToken}` : "/menu"}
          >
            Lihat status pesanan
          </Link>
        }
        onOpenChange={(open) => {
          if (!open) {
            setCreatedOrder(null);
          }
        }}
        open={createdOrder !== null}
        title="Pesanan terkirim"
      >
        {createdOrder ? (
          <div className="flex flex-col gap-3">
            <div className="rounded-md border border-success/20 bg-success-subtle p-3">
              <p className="text-card-title text-foreground">
                {createdOrder.orderNumber}
              </p>
              <p className="text-caption text-muted-foreground">
                {createdOrder.tableName ?? menu.table.name},{" "}
                {formatCurrency(createdOrder.grandTotal)}
              </p>
            </div>
            <p className="text-body text-muted-foreground">
              {createdOrder.cashTendered !== null
                ? `Kasir akan membawa kembalian ${formatCurrency(createdOrder.cashTendered - createdOrder.grandTotal)} ke meja.`
                : "Pembayaran dilakukan di kasir."}{" "}
              Pesanan ini masuk ke antrean KDS.
            </p>
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}

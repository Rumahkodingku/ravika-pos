"use client";

import { LogOut, ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConnectionIndicator } from "@/components/feedback/connection-indicator";
import { EmptyState } from "@/components/feedback/empty-state";
import {
  PosCartProvider,
  usePosCart,
} from "@/components/shells/pos-cart-context";
import { ShellTheme } from "@/components/shells/shell-theme";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { QuantityControl } from "@/components/ui/quantity-control";
import { useMockSession } from "@/features/auth/mock-session";
import { formatCurrency } from "@/lib/format";
import { useManagementStore } from "@/mocks/management/hooks";
import type { Outlet, SessionUser } from "@/types/auth";

function CartPanel() {
  const {
    itemCount,
    lines,
    orderType,
    removeProduct,
    setOrderType,
    setQuantity,
    subtotal,
  } = usePosCart();

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-section-title text-foreground">Pesanan</h2>
          <p className="text-caption text-muted-foreground">
            {itemCount} item di keranjang
          </p>
        </div>
        <Badge tone="neutral">Data contoh</Badge>
      </div>

      <div className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-surface p-1">
        <button
          aria-pressed={orderType === "DINE_IN"}
          className={`min-h-11 rounded-md px-3 text-label font-medium transition-colors ${
            orderType === "DINE_IN"
              ? "bg-primary-action text-primary-action-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
          onClick={() => setOrderType("DINE_IN")}
          type="button"
        >
          Dine-in
        </button>
        <button
          aria-pressed={orderType === "TAKEAWAY"}
          className={`min-h-11 rounded-md px-3 text-label font-medium transition-colors ${
            orderType === "TAKEAWAY"
              ? "bg-primary-action text-primary-action-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
          onClick={() => setOrderType("TAKEAWAY")}
          type="button"
        >
          Takeaway
        </button>
      </div>

      {lines.length === 0 ? (
        <EmptyState
          className="min-h-40"
          description="Pilih produk untuk mulai membuat pesanan."
          icon={ShoppingCart}
          title="Keranjang masih kosong"
        />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
          {lines.map((line) => (
            <div
              className="flex flex-col gap-2 rounded-md border border-border bg-surface p-3"
              key={line.product.id}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <p className="truncate text-body font-medium text-foreground">
                    {line.product.name}
                  </p>
                  {line.note ? (
                    <p className="text-caption text-muted-foreground">
                      {line.note}
                    </p>
                  ) : null}
                </div>
                <Button
                  aria-label={`Hapus ${line.product.name}`}
                  className="-mr-1 -mt-1 shrink-0"
                  onClick={() => removeProduct(line.product.id)}
                  size="icon"
                  variant="ghost"
                >
                  <Trash2 aria-hidden="true" className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between gap-2">
                <QuantityControl
                  onChange={(quantity) =>
                    setQuantity(line.product.id, quantity)
                  }
                  value={line.quantity}
                />
                <span className="text-body font-medium tabular-nums text-foreground">
                  {formatCurrency(line.product.price * line.quantity)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-auto flex flex-col gap-2 border-t border-border pt-3">
        <div className="flex items-center justify-between text-body text-muted-foreground">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-card-title text-foreground">
          <span>Total</span>
          <span className="tabular-nums">{formatCurrency(subtotal)}</span>
        </div>
        <Button className="w-full" disabled>
          Checkout aktif di Fase 3
        </Button>
      </div>
    </div>
  );
}

function PosShellContent({
  cashier,
  children,
  onLogout,
  outlet,
}: {
  cashier: SessionUser;
  children: React.ReactNode;
  onLogout: () => void;
  outlet: Outlet;
}) {
  const [cartOpen, setCartOpen] = useState(false);
  const { itemCount, subtotal } = usePosCart();

  return (
    <div className="flex min-h-dvh flex-col bg-surface-subtle">
      <header className="sticky top-0 z-[var(--z-sticky)] border-b border-border bg-surface">
        <div className="flex min-h-[var(--ravika-header-height)] flex-wrap items-center gap-3 px-4 py-2 sm:px-6">
          <Link
            className="flex shrink-0 items-baseline gap-1.5 rounded-md py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            href="/app/pos"
          >
            <span className="text-lg font-bold tracking-tight text-foreground">
              RAVIKA
            </span>
            <span className="text-caption font-semibold text-primary-strong">
              POS
            </span>
          </Link>
          <div className="hidden min-w-0 flex-col sm:flex">
            <span className="truncate text-label font-medium text-foreground">
              {outlet.name}
            </span>
            <span className="truncate text-caption text-muted-foreground">
              Kasir: {cashier.name}
            </span>
          </div>
          <ConnectionIndicator className="ml-auto" status="connected" />
          <ThemeToggle />
          <Button
            className="lg:hidden"
            onClick={() => setCartOpen(true)}
            size="md"
            variant="outline"
          >
            <ShoppingCart aria-hidden="true" className="h-4 w-4" />
            Keranjang
            {itemCount > 0 ? <Badge tone="primary">{itemCount}</Badge> : null}
          </Button>
          <button
            aria-label="Keluar POS"
            className={buttonVariants({ variant: "outline", size: "md" })}
            onClick={onLogout}
            type="button"
          >
            <LogOut aria-hidden="true" className="h-4 w-4" />
            <span className="hidden sm:inline">Keluar POS</span>
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <main className="min-w-0 flex-1 p-4 pb-28 sm:p-6 lg:pb-6">
          {children}
        </main>
        <aside className="hidden w-80 shrink-0 border-l border-border bg-surface p-4 lg:block xl:w-96">
          <div className="sticky top-24 h-[calc(100dvh-7rem)]">
            <CartPanel />
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-[var(--z-sticky)] border-t border-border bg-surface p-3 lg:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-caption text-muted-foreground">
              {itemCount} item
            </span>
            <span className="text-body font-semibold tabular-nums text-foreground">
              {formatCurrency(subtotal)}
            </span>
          </div>
          <Button onClick={() => setCartOpen(true)} size="md">
            <ShoppingCart aria-hidden="true" className="h-4 w-4" />
            Lihat keranjang
          </Button>
        </div>
      </div>

      <Drawer
        onOpenChange={setCartOpen}
        open={cartOpen}
        side="right"
        title="Keranjang"
      >
        <CartPanel />
      </Drawer>
    </div>
  );
}

export function PosShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { logout, user } = useMockSession();
  const outlets = useManagementStore((state) => state.outlets);
  const outlet = outlets.find(
    (candidate) =>
      candidate.isActive !== false && user?.outletIds.includes(candidate.id),
  );

  if (!user || !outlet) {
    return null;
  }

  return (
    <ShellTheme defaultTheme="light">
      <PosCartProvider>
        <PosShellContent
          cashier={user}
          onLogout={() => {
            logout();
            router.replace("/login");
          }}
          outlet={outlet}
        >
          {children}
        </PosShellContent>
      </PosCartProvider>
    </ShellTheme>
  );
}

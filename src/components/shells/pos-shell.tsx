"use client";

import { Armchair, LogOut, ShoppingCart, Trash2, Wallet } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ConnectionIndicator } from "@/components/feedback/connection-indicator";
import { EmptyState } from "@/components/feedback/empty-state";
import {
  PosCartProvider,
  usePosCart,
} from "@/components/shells/pos-cart-context";
import { ShellTheme } from "@/components/shells/shell-theme";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { Field } from "@/components/ui/field";
import { QuantityControl } from "@/components/ui/quantity-control";
import { Textarea } from "@/components/ui/textarea";
import { useLogoutMutation } from "@/features/auth/api";
import { useSession } from "@/features/auth/session-provider";
import { useTablesQuery } from "@/features/management/api/tables";
import {
  useBusinessQuery,
  usePayableOrdersQuery,
} from "@/features/operational/api";
import { OrderConfirmation } from "@/features/operational/order-confirmation";
import { PosCheckoutDrawer } from "@/features/operational/pos-checkout-drawer";
import { PosPayableOrderDrawer } from "@/features/operational/pos-payable-order-drawer";
import { PosPaymentDrawer } from "@/features/operational/pos-payment-drawer";
import {
  TablePickerDrawer,
  TableSelector,
} from "@/features/operational/table-selector";
import { useConnectionStatus } from "@/features/operational/use-connection-status";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";
import type { SessionUser } from "@/types/auth";
import type { Order } from "@/types/domain";

function CartHeader() {
  const { itemCount } = usePosCart();

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-section-title text-foreground">Pesanan</h2>
        <p className="text-caption text-muted-foreground">
          {itemCount} item di keranjang
        </p>
      </div>
    </div>
  );
}

function CartControls({
  mode,
  onOpenTablePicker,
}: {
  mode: "panel" | "drawer";
  onOpenTablePicker: () => void;
}) {
  const { orderType, setOrderType, setTableId, tableId } = usePosCart();
  const { data: tableData } = useTablesQuery({ pageSize: 100 });
  const selectedTable =
    tableData?.items.find((table) => table.id === tableId) ?? null;

  return (
    <>
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
          onClick={() => {
            setOrderType("TAKEAWAY");
            setTableId(null);
          }}
          type="button"
        >
          Takeaway
        </button>
      </div>

      {orderType === "DINE_IN" ? (
        mode === "drawer" ? (
          <Button
            className="w-full justify-between"
            onClick={onOpenTablePicker}
            variant="outline"
          >
            <span className="flex items-center gap-2">
              <Armchair aria-hidden="true" className="h-4 w-4" />
              Pilih meja
            </span>
            <span className="text-caption text-muted-foreground">
              {selectedTable?.name ?? "Dine-in"}
            </span>
          </Button>
        ) : (
          <TableSelector onChange={setTableId} value={tableId} />
        )
      ) : null}
    </>
  );
}

function CartLines({
  idPrefix,
  scroll,
}: {
  idPrefix: string;
  scroll: boolean;
}) {
  const { lines, orderNotes, removeLine, setOrderNotes, setQuantity } =
    usePosCart();

  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        scroll &&
          "min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1 [scrollbar-gutter:stable]",
      )}
    >
      {lines.length === 0 ? (
        <EmptyState
          className="min-h-40"
          description="Pilih produk untuk mulai membuat pesanan."
          icon={ShoppingCart}
          title="Keranjang masih kosong"
        />
      ) : (
        lines.map((line) => (
          <div
            className="flex flex-col gap-2 rounded-md border border-border bg-surface p-3"
            key={line.key}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="truncate text-body font-medium text-foreground">
                  {line.product.name}
                </p>
                {line.variant ? (
                  <p className="text-caption text-muted-foreground">
                    Varian {line.variant.name}
                  </p>
                ) : null}
                {line.addOns.map((addOn) => (
                  <p
                    className="text-caption text-muted-foreground"
                    key={addOn.id}
                  >
                    Add-on {addOn.name}
                  </p>
                ))}
                {line.notes ? (
                  <p className="text-caption text-muted-foreground">
                    Catatan: {line.notes}
                  </p>
                ) : null}
              </div>
              <Button
                aria-label={`Hapus ${line.product.name}`}
                className="-mr-1 -mt-1 shrink-0"
                onClick={() => removeLine(line.key)}
                size="icon"
                variant="ghost"
              >
                <Trash2 aria-hidden="true" className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between gap-2">
              <QuantityControl
                onChange={(quantity) => setQuantity(line.key, quantity)}
                value={line.quantity}
              />
              <span className="text-body font-medium tabular-nums text-foreground">
                {formatCurrency(line.lineTotal)}
              </span>
            </div>
          </div>
        ))
      )}

      <Field htmlFor={`${idPrefix}-order-notes`} label="Catatan pesanan">
        <Textarea
          id={`${idPrefix}-order-notes`}
          onChange={(event) => setOrderNotes(event.target.value)}
          placeholder="Contoh: sajikan bersama"
          value={orderNotes}
        />
      </Field>
    </div>
  );
}

function CartSummary({ onCheckout }: { onCheckout: () => void }) {
  const { lines, orderType, subtotal, tableId } = usePosCart();

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center justify-between text-body text-muted-foreground">
        <span>Subtotal</span>
        <span className="tabular-nums">{formatCurrency(subtotal)}</span>
      </div>
      <div className="flex items-center justify-between text-card-title text-foreground">
        <span>Total</span>
        <span className="tabular-nums">{formatCurrency(subtotal)}</span>
      </div>
      <Button
        className="w-full"
        disabled={
          lines.length === 0 || (orderType === "DINE_IN" && tableId === null)
        }
        onClick={onCheckout}
      >
        Lanjut ke konfirmasi
      </Button>
      {orderType === "DINE_IN" && tableId === null ? (
        <p className="text-caption text-muted-foreground">
          Pilih meja sebelum konfirmasi.
        </p>
      ) : null}
    </div>
  );
}

function CartPanel({
  idPrefix,
  mode,
  onCheckout,
  onOpenTablePicker,
}: {
  idPrefix: string;
  mode: "panel" | "drawer";
  onCheckout: () => void;
  onOpenTablePicker: () => void;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        mode === "panel" && "h-full min-h-0",
      )}
    >
      {mode === "panel" ? <CartHeader /> : null}
      <CartControls mode={mode} onOpenTablePicker={onOpenTablePicker} />
      <CartLines idPrefix={idPrefix} scroll={mode === "panel"} />
      {mode === "panel" ? (
        <div className="mt-auto border-t border-border pt-3">
          <CartSummary onCheckout={onCheckout} />
        </div>
      ) : null}
    </div>
  );
}

function PosShellContent({
  cashier,
  children,
  onLogout,
}: {
  cashier: SessionUser;
  children: React.ReactNode;
  onLogout: () => void;
}) {
  const { clearCart, itemCount, setTableId, subtotal, tableId } = usePosCart();
  const { data: business } = useBusinessQuery();
  const { data: payableOrders = [] } = usePayableOrdersQuery();
  const connectionStatus = useConnectionStatus();
  const [cartOpen, setCartOpen] = useState(false);
  const [tablePickerOpen, setTablePickerOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);
  const [payableOpen, setPayableOpen] = useState(false);

  const payableCount = payableOrders.length;

  return (
    <div className="flex min-h-dvh flex-col bg-surface-subtle">
      <header className="sticky top-0 z-[var(--z-sticky)] border-b border-border bg-surface">
        <div className="flex min-h-[var(--ravika-header-height)] flex-wrap items-center gap-3 px-4 py-2 sm:px-6">
          <Link
            className="flex shrink-0 items-center gap-2 rounded-md py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            href="/app/pos"
          >
            <BrandLogo priority size="sm" />
            <span className="text-lg font-bold tracking-tight text-foreground">
              RAVIKA
            </span>
            <span className="text-caption font-semibold text-primary-strong">
              POS
            </span>
          </Link>
          <div className="hidden min-w-0 flex-col sm:flex">
            <span className="truncate text-label font-medium text-foreground">
              {business?.name ?? "RAVIKA"}
            </span>
            <span className="truncate text-caption text-muted-foreground">
              Kasir: {cashier.name}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="sm:hidden">
              <ConnectionIndicator compact status={connectionStatus} />
            </div>
            <div className="hidden sm:block">
              <ConnectionIndicator status={connectionStatus} />
            </div>
            <ThemeToggle />
            <Button
              aria-label="Pesanan perlu dibayar"
              onClick={() => setPayableOpen(true)}
              variant="outline"
            >
              <Wallet aria-hidden="true" className="h-4 w-4" />
              <span className="hidden sm:inline">Pesanan</span>
              {payableCount > 0 ? (
                <Badge tone="warning">{payableCount}</Badge>
              ) : null}
            </Button>
            <Button
              aria-label="Buka keranjang"
              className="lg:hidden"
              onClick={() => setCartOpen(true)}
              variant="outline"
            >
              <ShoppingCart aria-hidden="true" className="h-4 w-4" />
              <span className="hidden sm:inline">Keranjang</span>
              {itemCount > 0 ? <Badge tone="primary">{itemCount}</Badge> : null}
            </Button>
            <Button
              aria-label="Keluar POS"
              onClick={() => {
                clearCart();
                onLogout();
              }}
              variant="outline"
            >
              <LogOut aria-hidden="true" className="h-4 w-4" />
              <span className="hidden sm:inline">Keluar POS</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <main className="min-w-0 flex-1 p-4 pb-28 sm:p-6 lg:pb-6">
          {children}
        </main>
        <aside className="hidden w-80 shrink-0 border-l border-border bg-surface p-4 lg:block xl:w-96">
          <div className="sticky top-24 h-[calc(100dvh-7rem)]">
            <CartPanel
              idPrefix="pos-cart-desktop"
              mode="panel"
              onCheckout={() => setCheckoutOpen(true)}
              onOpenTablePicker={() => setTablePickerOpen(true)}
            />
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
        description={`${itemCount} item di keranjang`}
        footer={
          <div className="w-full">
            <CartSummary
              onCheckout={() => {
                setCartOpen(false);
                setCheckoutOpen(true);
              }}
            />
          </div>
        }
        onOpenChange={setCartOpen}
        open={cartOpen}
        side="right"
        title="Keranjang"
      >
        <CartPanel
          idPrefix="pos-cart-mobile"
          mode="drawer"
          onCheckout={() => {
            setCartOpen(false);
            setCheckoutOpen(true);
          }}
          onOpenTablePicker={() => {
            setCartOpen(false);
            setTablePickerOpen(true);
          }}
        />
      </Drawer>

      <TablePickerDrawer
        onChange={(nextTableId) => {
          setTableId(nextTableId);
          setTablePickerOpen(false);
          setCartOpen(true);
        }}
        onOpenChange={(open) => {
          setTablePickerOpen(open);
          if (!open) {
            setCartOpen(true);
          }
        }}
        open={tablePickerOpen}
        value={tableId}
      />

      <PosCheckoutDrawer
        onCreated={(order) => {
          setCreatedOrder(order);
          setConfirmationOpen(true);
        }}
        onOpenChange={setCheckoutOpen}
        open={checkoutOpen}
      />

      <OrderConfirmation
        onOpenChange={setConfirmationOpen}
        onPay={setPaymentOrder}
        open={confirmationOpen}
        order={createdOrder}
      />

      <PosPayableOrderDrawer
        onOpenChange={setPayableOpen}
        onPay={setPaymentOrder}
        open={payableOpen}
      />

      <PosPaymentDrawer
        onOpenChange={(open) => {
          if (!open) {
            setPaymentOrder(null);
          }
        }}
        open={paymentOrder !== null}
        order={paymentOrder}
      />
    </div>
  );
}

export function PosShell({ children }: { children: React.ReactNode }) {
  const { user } = useSession();
  const { mutate: logout } = useLogoutMutation();

  return (
    <ShellTheme defaultTheme="light">
      <PosCartProvider>
        <PosShellContent
          cashier={user}
          onLogout={() => {
            logout();
          }}
        >
          {children}
        </PosShellContent>
      </PosCartProvider>
    </ShellTheme>
  );
}

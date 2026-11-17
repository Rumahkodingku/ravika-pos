"use client";

import { useState } from "react";
import { EmptyState } from "@/components/feedback/empty-state";
import { usePosCart } from "@/components/shells/pos-cart-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { useToast } from "@/components/ui/toast";
import { useMockSession } from "@/features/auth/mock-session";
import { formatCurrency } from "@/lib/format";
import { useManagementStore } from "@/mocks/management/hooks";
import { managementService } from "@/mocks/management/service";
import type { Order } from "@/types/domain";

export function PosCheckoutDrawer({
  onCreated,
  onOpenChange,
  open,
}: {
  onCreated: (order: Order) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const { toast } = useToast();
  const { user } = useMockSession();
  const tables = useManagementStore((state) => state.tables);
  const { clearCart, lines, orderNotes, orderType, subtotal, tableId } =
    usePosCart();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const table = tables.find((candidate) => candidate.id === tableId);
  const canSubmit =
    lines.length > 0 && (orderType === "TAKEAWAY" || tableId !== null);

  const submit = async () => {
    if (!user) {
      return;
    }
    if (!canSubmit) {
      setError(
        orderType === "DINE_IN"
          ? "Pilih meja terlebih dahulu."
          : "Keranjang masih kosong.",
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const order = await managementService.createOrder({
        orderType,
        tableId: orderType === "DINE_IN" ? tableId : null,
        source: "CASHIER",
        createdBy: user.id,
        notes: orderNotes,
        items: lines.map((line) => ({
          productId: line.productId,
          variantId: line.variantId,
          addOnIds: line.addOnIds,
          quantity: line.quantity,
          notes: line.notes,
        })),
      });
      clearCart();
      onCreated(order);
      onOpenChange(false);
      toast({
        title: "Pesanan dibuat",
        description: `${order.orderNumber} masuk antrean KDS.`,
        tone: "success",
      });
    } catch (reason) {
      const message =
        reason instanceof Error ? reason.message : "Pesanan gagal dibuat.";
      setError(message);
      toast({
        title: "Pesanan gagal dibuat",
        description: message,
        tone: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer
      description="Periksa pesanan sebelum dikirim ke KDS."
      footer={
        <>
          <Button
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
            variant="outline"
          >
            Batal
          </Button>
          <Button
            disabled={!canSubmit}
            isLoading={isSubmitting}
            onClick={submit}
          >
            Konfirmasi pesanan
          </Button>
        </>
      }
      onOpenChange={onOpenChange}
      open={open}
      title="Konfirmasi pesanan"
    >
      {lines.length === 0 ? (
        <EmptyState
          description="Pilih produk untuk mulai membuat pesanan."
          title="Keranjang masih kosong"
        />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <Badge tone="neutral">
              {orderType === "DINE_IN" ? "Dine-in" : "Takeaway"}
            </Badge>
            {orderType === "DINE_IN" ? (
              <Badge tone={table ? "info" : "warning"}>
                {table?.name ?? "Meja belum dipilih"}
              </Badge>
            ) : null}
          </div>

          <ul className="flex flex-col gap-2">
            {lines.map((line) => (
              <li
                className="flex items-start justify-between gap-3 rounded-md border border-border p-3"
                key={line.key}
              >
                <div className="flex min-w-0 flex-col">
                  <span className="text-body font-medium text-foreground">
                    {line.quantity} x {line.product.name}
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
                <span className="shrink-0 text-body tabular-nums text-foreground">
                  {formatCurrency(line.lineTotal)}
                </span>
              </li>
            ))}
          </ul>

          {orderNotes ? (
            <p className="rounded-md border border-border bg-surface-subtle p-3 text-caption text-muted-foreground">
              Catatan pesanan: {orderNotes}
            </p>
          ) : null}

          <div className="flex flex-col gap-1 border-t border-border pt-3">
            <div className="flex items-center justify-between text-body text-muted-foreground">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-card-title text-foreground">
              <span>Total</span>
              <span className="tabular-nums">{formatCurrency(subtotal)}</span>
            </div>
          </div>

          {error ? (
            <p
              className="rounded-md border border-danger/20 bg-danger-subtle px-3 py-2 text-body text-danger-strong"
              role="alert"
            >
              {error}
            </p>
          ) : null}
        </div>
      )}
    </Drawer>
  );
}

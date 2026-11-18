"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Drawer } from "@/components/ui/drawer";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import {
  useCancelOrderMutation,
  useOrderHistoryQuery,
  useOrderPaymentsQuery,
  useOrderQuery,
  useRefundOrderMutation,
} from "@/features/management/api/orders";
import { PermissionGate } from "@/features/management/permission-gate";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { Order, PaymentMethod } from "@/types/domain";

const reasonSchema = z.object({
  reason: z.string().min(3, "Alasan minimal 3 karakter."),
});

type ReasonValues = z.infer<typeof reasonSchema>;

const paymentMethodLabels: Record<PaymentMethod, string> = {
  CASH: "Tunai",
  QRIS: "QRIS",
  TRANSFER: "Transfer",
  E_WALLET: "Dompet digital",
};

const statusLabels: Record<string, string> = {
  NEW: "Baru",
  ACCEPTED: "Diterima",
  PREPARING: "Disiapkan",
  READY: "Siap",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

const cancellableStatuses = ["NEW", "ACCEPTED", "PREPARING"];
const recordedPaymentStatuses = ["PAID", "PARTIALLY_PAID"];

export function OrderDetailDrawer({
  onOpenChange,
  onOrderChanged,
  order,
}: {
  onOpenChange: (open: boolean) => void;
  onOrderChanged?: () => void;
  order: Order | null;
}) {
  const { toast } = useToast();
  const orderQuery = useOrderQuery(order?.id ?? null, {
    enabled: order !== null,
  });
  const paymentsQuery = useOrderPaymentsQuery(order?.id ?? null, {
    enabled: order !== null,
  });
  const historyQuery = useOrderHistoryQuery(order?.id ?? null, {
    enabled: order !== null,
  });
  const cancelMutation = useCancelOrderMutation();
  const refundMutation = useRefundOrderMutation();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const current = orderQuery.data ?? order;
  const payments = paymentsQuery.data ?? [];
  const history = historyQuery.data ?? [];

  const cancelForm = useForm<ReasonValues>({
    defaultValues: { reason: "" },
    resolver: zodResolver(reasonSchema),
  });
  const refundForm = useForm<ReasonValues>({
    defaultValues: { reason: "" },
    resolver: zodResolver(reasonSchema),
  });

  // Backend blocks cancel only while a RECORDED payment exists, so a refunded order can still be cancelled.
  const canCancel =
    current !== null &&
    (current.paymentStatus === "UNPAID" ||
      current.paymentStatus === "REFUNDED") &&
    cancellableStatuses.includes(current.orderStatus);
  const hasRecordedPayment =
    current !== null && recordedPaymentStatuses.includes(current.paymentStatus);
  const canRefund = current !== null && current.paymentStatus === "PAID";

  const onCancel = cancelForm.handleSubmit(async (values) => {
    if (!current) {
      return;
    }

    try {
      await cancelMutation.mutateAsync({
        id: current.id,
        reason: values.reason,
      });
      toast({
        title: "Pesanan dibatalkan",
        description: `${current.orderNumber} tetap tersimpan dengan status dibatalkan.`,
        tone: "success",
      });
      setCancelOpen(false);
      cancelForm.reset();
      onOrderChanged?.();
      onOpenChange(false);
    } catch (reason) {
      toast({
        title: "Pesanan gagal dibatalkan",
        description: reason instanceof Error ? reason.message : "Coba lagi.",
        tone: "danger",
      });
    }
  });

  const onRefund = refundForm.handleSubmit(async (values) => {
    if (!current) {
      return;
    }

    try {
      await refundMutation.mutateAsync({
        id: current.id,
        reason: values.reason,
      });
      toast({
        title: "Refund tercatat",
        description: `${current.orderNumber} dikembalikan penuh.`,
        tone: "success",
      });
      setRefundOpen(false);
      refundForm.reset();
      onOrderChanged?.();
      onOpenChange(false);
    } catch (reason) {
      toast({
        title: "Refund gagal dicatat",
        description: reason instanceof Error ? reason.message : "Coba lagi.",
        tone: "danger",
      });
    }
  });

  return (
    <>
      <Drawer
        description={
          current
            ? `${current.orderNumber}, ${formatDateTime(current.createdAt)}`
            : undefined
        }
        onOpenChange={onOpenChange}
        open={order !== null}
        title="Detail pesanan"
      >
        {current ? (
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap gap-2">
              <StatusBadge kind="preparation" status={current.orderStatus} />
              <StatusBadge kind="payment" status={current.paymentStatus} />
              <Badge tone="neutral">
                {current.orderType === "DINE_IN" ? "Dine-in" : "Takeaway"}
              </Badge>
              <Badge tone="neutral">
                {current.source === "QR" ? "QR menu" : "Kasir"}
              </Badge>
            </div>

            <dl className="grid gap-2 text-body">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Meja</dt>
                <dd>{current.tableName ?? "Tidak ada"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Dibuat oleh</dt>
                <dd>{current.createdByName ?? "Tidak ada"}</dd>
              </div>
              {current.notes ? (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Catatan</dt>
                  <dd className="max-w-56 text-right">{current.notes}</dd>
                </div>
              ) : null}
            </dl>

            <div className="flex flex-col gap-2 border-t border-border pt-4">
              <p className="text-label font-medium text-foreground">Item</p>
              {current.items.map((item) => (
                <div
                  className="flex flex-col gap-1 rounded-md border border-border p-3"
                  key={item.id}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="text-body font-medium text-foreground">
                        {item.quantity} x {item.productName}
                      </span>
                      {item.variantName ? (
                        <span className="text-caption text-muted-foreground">
                          Varian {item.variantName}
                        </span>
                      ) : null}
                      {item.addOns.map((addOn) => (
                        <span
                          className="text-caption text-muted-foreground"
                          key={addOn.id}
                        >
                          Add-on {addOn.name} ({formatCurrency(addOn.price)})
                        </span>
                      ))}
                      {item.notes ? (
                        <span className="text-caption text-muted-foreground">
                          Catatan: {item.notes}
                        </span>
                      ) : null}
                    </div>
                    <span className="shrink-0 text-body tabular-nums text-foreground">
                      {formatCurrency(item.lineTotal)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <dl className="flex flex-col gap-1 border-t border-border pt-4 text-body">
              <div className="flex justify-between gap-3 text-muted-foreground">
                <dt>Subtotal</dt>
                <dd className="tabular-nums">
                  {formatCurrency(current.subtotal)}
                </dd>
              </div>
              <div className="flex justify-between gap-3 text-card-title text-foreground">
                <dt>Total</dt>
                <dd className="tabular-nums">
                  {formatCurrency(current.grandTotal)}
                </dd>
              </div>
            </dl>

            <div className="flex flex-col gap-2 border-t border-border pt-4">
              <p className="text-label font-medium text-foreground">
                Pembayaran
              </p>
              {paymentsQuery.isLoading ? (
                <p className="text-body text-muted-foreground">
                  Memuat pembayaran...
                </p>
              ) : paymentsQuery.error ? (
                <p className="text-body text-danger-strong">
                  Pembayaran gagal dimuat.
                </p>
              ) : payments.length === 0 ? (
                <p className="text-body text-muted-foreground">
                  Belum ada pembayaran tercatat.
                </p>
              ) : (
                payments.map((payment) => (
                  <div
                    className="flex items-start justify-between gap-2 rounded-md border border-border p-3 text-body"
                    key={payment.id}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {paymentMethodLabels[payment.method]}
                      </span>
                      <span className="text-caption text-muted-foreground">
                        {formatDateTime(payment.paidAt)}
                      </span>
                      <span className="text-caption text-muted-foreground">
                        Dicatat oleh {payment.recordedByName ?? "Tidak ada"}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="tabular-nums">
                        {formatCurrency(payment.amount)}
                      </span>
                      <Badge
                        tone={
                          payment.status === "REFUNDED" ? "info" : "success"
                        }
                      >
                        {payment.status === "REFUNDED"
                          ? "Dikembalikan"
                          : "Tercatat"}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex flex-col gap-2 border-t border-border pt-4">
              <p className="text-label font-medium text-foreground">
                Riwayat status
              </p>
              {historyQuery.isLoading ? (
                <p className="text-body text-muted-foreground">
                  Memuat riwayat...
                </p>
              ) : historyQuery.error ? (
                <p className="text-body text-danger-strong">
                  Riwayat gagal dimuat.
                </p>
              ) : history.length === 0 ? (
                <p className="text-body text-muted-foreground">
                  Belum ada riwayat status.
                </p>
              ) : (
                history.map((entry) => (
                  <div
                    className="flex flex-col gap-0.5 text-body"
                    key={entry.id}
                  >
                    <span className="font-medium text-foreground">
                      {entry.previousStatus
                        ? `${statusLabels[entry.previousStatus]} menjadi ${statusLabels[entry.newStatus]}`
                        : statusLabels[entry.newStatus]}
                    </span>
                    <span className="text-caption text-muted-foreground">
                      {formatDateTime(entry.createdAt)} oleh{" "}
                      {entry.changedByName ?? "Tidak ada"}
                    </span>
                    {entry.reason ? (
                      <span className="text-caption text-muted-foreground">
                        Alasan: {entry.reason}
                      </span>
                    ) : null}
                  </div>
                ))
              )}
            </div>

            <div className="flex flex-col gap-2 border-t border-border pt-4">
              <PermissionGate permission="orders.cancel">
                {canCancel ? (
                  <Button onClick={() => setCancelOpen(true)} variant="danger">
                    Batalkan pesanan
                  </Button>
                ) : (
                  <p className="rounded-md border border-border bg-surface-subtle px-3 py-2 text-caption text-muted-foreground">
                    {hasRecordedPayment
                      ? "Pembayaran sudah tercatat. Gunakan refund bila pesanan perlu dikembalikan."
                      : "Pesanan dengan status ini tidak dapat dibatalkan dari management."}
                  </p>
                )}
              </PermissionGate>
              <PermissionGate permission="payments.refund">
                {canRefund ? (
                  <Button onClick={() => setRefundOpen(true)} variant="outline">
                    Refund pesanan
                  </Button>
                ) : null}
              </PermissionGate>
            </div>
          </div>
        ) : null}
      </Drawer>

      <Dialog
        description="Pembatalan tidak menghapus pesanan. Status dan riwayat tetap tersimpan."
        footer={
          <>
            <Button
              disabled={cancelMutation.isPending}
              onClick={() => setCancelOpen(false)}
              variant="outline"
            >
              Kembali
            </Button>
            <Button
              form="cancel-order-form"
              isLoading={cancelMutation.isPending}
              type="submit"
              variant="danger"
            >
              Batalkan pesanan
            </Button>
          </>
        }
        onOpenChange={setCancelOpen}
        open={cancelOpen}
        size="sm"
        title="Batalkan pesanan?"
      >
        <form id="cancel-order-form" onSubmit={onCancel}>
          <Field
            error={cancelForm.formState.errors.reason?.message}
            htmlFor="cancel-reason"
            label="Alasan pembatalan"
            required
          >
            <Textarea
              id="cancel-reason"
              placeholder="Contoh: stok bahan habis"
              {...cancelForm.register("reason")}
            />
          </Field>
        </form>
      </Dialog>

      <Dialog
        description="Refund mengembalikan seluruh pembayaran pesanan dan tidak dapat dibatalkan."
        footer={
          <>
            <Button
              disabled={refundMutation.isPending}
              onClick={() => setRefundOpen(false)}
              variant="outline"
            >
              Kembali
            </Button>
            <Button
              form="refund-order-form"
              isLoading={refundMutation.isPending}
              type="submit"
            >
              Proses refund
            </Button>
          </>
        }
        onOpenChange={setRefundOpen}
        open={refundOpen}
        size="sm"
        title="Refund pesanan?"
      >
        <form id="refund-order-form" onSubmit={onRefund}>
          <Field
            error={refundForm.formState.errors.reason?.message}
            htmlFor="refund-reason"
            label="Alasan refund"
            required
          >
            <Textarea
              id="refund-reason"
              placeholder="Contoh: pesanan dibatalkan pelanggan"
              {...refundForm.register("reason")}
            />
          </Field>
        </form>
      </Dialog>
    </>
  );
}

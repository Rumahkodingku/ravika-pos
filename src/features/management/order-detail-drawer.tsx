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
import { useMockSession } from "@/features/auth/mock-session";
import { PermissionGate } from "@/features/management/permission-gate";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { useAsyncData, useManagementStore } from "@/mocks/management/hooks";
import { managementService } from "@/mocks/management/service";
import type { Order, PaymentMethod } from "@/types/domain";

const cancelSchema = z.object({
  reason: z.string().min(3, "Alasan minimal 3 karakter."),
});

type CancelValues = z.infer<typeof cancelSchema>;

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

export function OrderDetailDrawer({
  onOpenChange,
  onOrderChanged,
  order,
}: {
  onOpenChange: (open: boolean) => void;
  onOrderChanged: () => void;
  order: Order | null;
}) {
  const { toast } = useToast();
  const { user } = useMockSession();
  const tables = useManagementStore((state) => state.tables);
  const users = useManagementStore((state) => state.users);
  const payments = useManagementStore((state) => state.payments);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const { data, error, isLoading } = useAsyncData(
    () =>
      order
        ? Promise.all([
            managementService.getOrderPayments(order.id),
            managementService.getOrderHistory(order.id),
          ])
        : Promise.resolve(null),
    order?.id ?? "none",
  );

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<CancelValues>({
    defaultValues: { reason: "" },
    resolver: zodResolver(cancelSchema),
  });

  const tableName = (id: string | null) =>
    tables.find((table) => table.id === id)?.name ?? "Tidak ada";
  const userName = (id: string | null) =>
    users.find((candidate) => candidate.id === id)?.name ?? "Sistem";

  const hasRecordedPayment =
    order !== null &&
    payments.some(
      (payment) =>
        payment.orderId === order.id && payment.status === "RECORDED",
    );
  const canCancel =
    order !== null &&
    !hasRecordedPayment &&
    ["NEW", "ACCEPTED", "PREPARING"].includes(order.orderStatus) &&
    user?.permissions.includes("orders.cancel");

  const onCancel = handleSubmit(async (values) => {
    if (!order || !user) {
      return;
    }
    setIsCancelling(true);
    try {
      await managementService.cancelOrder(order.id, values.reason, user.id);
      toast({
        title: "Pesanan dibatalkan",
        description: `${order.orderNumber} tetap tersimpan dengan status dibatalkan.`,
        tone: "success",
      });
      setCancelOpen(false);
      reset();
      onOrderChanged();
      onOpenChange(false);
    } catch (reason) {
      toast({
        title: "Pesanan gagal dibatalkan",
        description: reason instanceof Error ? reason.message : "Coba lagi.",
        tone: "danger",
      });
    } finally {
      setIsCancelling(false);
    }
  });

  return (
    <>
      <Drawer
        description={
          order
            ? `${order.orderNumber}, ${formatDateTime(order.createdAt)}`
            : undefined
        }
        onOpenChange={onOpenChange}
        open={order !== null}
        title="Detail pesanan"
      >
        {order ? (
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap gap-2">
              <StatusBadge kind="preparation" status={order.orderStatus} />
              <StatusBadge kind="payment" status={order.paymentStatus} />
              <Badge tone="neutral">
                {order.orderType === "DINE_IN" ? "Dine-in" : "Takeaway"}
              </Badge>
              <Badge tone="neutral">
                {order.source === "QR" ? "QR menu" : "Kasir"}
              </Badge>
            </div>

            <dl className="grid gap-2 text-body">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Meja</dt>
                <dd>{tableName(order.tableId)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Dibuat oleh</dt>
                <dd>{userName(order.createdBy)}</dd>
              </div>
              {order.notes ? (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Catatan</dt>
                  <dd className="max-w-56 text-right">{order.notes}</dd>
                </div>
              ) : null}
            </dl>

            <div className="flex flex-col gap-2 border-t border-border pt-4">
              <p className="text-label font-medium text-foreground">Item</p>
              {order.items.map((item) => (
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
                  {formatCurrency(order.subtotal)}
                </dd>
              </div>
              <div className="flex justify-between gap-3 text-card-title text-foreground">
                <dt>Total</dt>
                <dd className="tabular-nums">
                  {formatCurrency(order.grandTotal)}
                </dd>
              </div>
            </dl>

            <div className="flex flex-col gap-2 border-t border-border pt-4">
              <p className="text-label font-medium text-foreground">
                Pembayaran
              </p>
              {isLoading ? (
                <p className="text-body text-muted-foreground">
                  Memuat pembayaran...
                </p>
              ) : error ? (
                <p className="text-body text-danger-strong">{error}</p>
              ) : !data || data[0].length === 0 ? (
                <p className="text-body text-muted-foreground">
                  Belum ada pembayaran tercatat.
                </p>
              ) : (
                data[0].map((payment) => (
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
                        Dicatat oleh {userName(payment.recordedBy)}
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
              {isLoading ? (
                <p className="text-body text-muted-foreground">
                  Memuat riwayat...
                </p>
              ) : !data || data[1].length === 0 ? (
                <p className="text-body text-muted-foreground">
                  Belum ada riwayat status.
                </p>
              ) : (
                data[1].map((history) => (
                  <div
                    className="flex flex-col gap-0.5 text-body"
                    key={history.id}
                  >
                    <span className="font-medium text-foreground">
                      {history.previousStatus
                        ? `${statusLabels[history.previousStatus]} menjadi ${statusLabels[history.newStatus]}`
                        : statusLabels[history.newStatus]}
                    </span>
                    <span className="text-caption text-muted-foreground">
                      {formatDateTime(history.createdAt)} oleh{" "}
                      {userName(history.changedBy)}
                    </span>
                    {history.reason ? (
                      <span className="text-caption text-muted-foreground">
                        Alasan: {history.reason}
                      </span>
                    ) : null}
                  </div>
                ))
              )}
            </div>

            <PermissionGate permission="orders.cancel">
              {canCancel ? (
                <Button onClick={() => setCancelOpen(true)} variant="danger">
                  Batalkan pesanan
                </Button>
              ) : (
                <p className="rounded-md border border-border bg-surface-subtle px-3 py-2 text-caption text-muted-foreground">
                  {hasRecordedPayment
                    ? "Pembayaran sudah tercatat. Refund belum tersedia."
                    : "Pesanan dengan status ini tidak dapat dibatalkan dari management."}
                </p>
              )}
            </PermissionGate>
          </div>
        ) : null}
      </Drawer>

      <Dialog
        description="Pembatalan tidak menghapus pesanan. Status dan riwayat tetap tersimpan."
        footer={
          <>
            <Button
              disabled={isCancelling}
              onClick={() => setCancelOpen(false)}
              variant="outline"
            >
              Kembali
            </Button>
            <Button
              form="cancel-order-form"
              isLoading={isCancelling}
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
            error={errors.reason?.message}
            htmlFor="cancel-reason"
            label="Alasan pembatalan"
            required
          >
            <Textarea
              id="cancel-reason"
              placeholder="Contoh: stok bahan habis"
              {...register("reason")}
            />
          </Field>
          <p className="mt-2 text-caption text-muted-foreground">
            Kebijakan pembatalan setelah status disiapkan masih menunggu
            keputusan produk.
          </p>
        </form>
      </Dialog>
    </>
  );
}

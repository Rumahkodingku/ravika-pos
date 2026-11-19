"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Drawer } from "@/components/ui/drawer";
import { Field, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { useOrderPaymentsQuery } from "@/features/management/api/orders";
import { useRecordPaymentMutation } from "@/features/operational/api";
import { createIdempotencyKey } from "@/lib/api/idempotency";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { Order, PaymentMethod } from "@/types/domain";

const paymentSchema = z.object({
  method: z.enum(["CASH", "QRIS", "TRANSFER", "E_WALLET"]),
  amount: z.number().int().positive("Nominal harus lebih dari 0."),
  reference: z.string(),
  notes: z.string(),
  verified: z.boolean(),
});

type PaymentValues = z.infer<typeof paymentSchema>;

const methodLabels: Record<PaymentMethod, string> = {
  CASH: "Tunai",
  QRIS: "QRIS",
  TRANSFER: "Transfer",
  E_WALLET: "Dompet digital",
};

export function PosPaymentDrawer({
  onOpenChange,
  onPaid,
  open,
  order,
}: {
  onOpenChange: (open: boolean) => void;
  onPaid?: () => void;
  open: boolean;
  order: Order | null;
}) {
  const { toast } = useToast();
  const recordPayment = useRecordPaymentMutation();
  const paymentsQuery = useOrderPaymentsQuery(order?.id ?? null, {
    enabled: open && order !== null,
  });
  const orderPayments = (paymentsQuery.data ?? [])
    .filter((payment) => payment.status === "RECORDED")
    .sort((left, right) => right.paidAt.localeCompare(left.paidAt));
  const paid = orderPayments.reduce(
    (total, payment) => total + payment.amount,
    0,
  );
  const remaining = Math.max(0, (order?.grandTotal ?? 0) - paid);
  const suggestedCash =
    paid === 0 ? (order?.cashTendered ?? remaining) : remaining;
  const lastResetKey = useRef<string | null>(null);

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
    watch,
  } = useForm<PaymentValues>({
    defaultValues: {
      method: "CASH",
      amount: suggestedCash,
      reference: "",
      notes: "",
      verified: false,
    },
    resolver: zodResolver(paymentSchema),
  });

  useEffect(() => {
    if (!open || !order) {
      lastResetKey.current = null;
      return;
    }

    const resetKey = `${order.id}:${open}`;

    if (lastResetKey.current === resetKey) {
      return;
    }

    lastResetKey.current = resetKey;
    reset({
      method: "CASH",
      amount: suggestedCash,
      reference: "",
      notes: "",
      verified: false,
    });
  }, [open, order, reset, suggestedCash]);

  const method = watch("method");
  const amount = watch("amount");

  useEffect(() => {
    if (!open || !order) {
      return;
    }

    setValue("amount", method === "CASH" ? suggestedCash : remaining);
  }, [method, open, order, remaining, setValue, suggestedCash]);

  const tendered = Number.isFinite(amount) ? amount : 0;
  const applied = Math.min(tendered, remaining);
  const change = method === "CASH" ? Math.max(0, tendered - remaining) : 0;
  const paymentLabel =
    remaining <= 0 ? "Lunas" : paid > 0 ? "Dibayar sebagian" : "Belum dibayar";
  const paymentTone =
    remaining <= 0 ? "success" : paid > 0 ? "warning" : "danger";
  const verifiedErrorId = errors.verified
    ? "payment-verified-error"
    : undefined;

  const onSubmit = handleSubmit(async (values) => {
    if (!order) {
      return;
    }
    if (values.method !== "CASH" && !values.verified) {
      setError("verified", {
        message: "Centang verifikasi pembayaran digital.",
      });
      return;
    }
    if (values.method !== "CASH" && values.amount > remaining) {
      setError("amount", {
        message: "Nominal melebihi sisa tagihan.",
      });
      return;
    }

    const appliedAmount =
      values.method === "CASH"
        ? Math.min(values.amount, remaining)
        : values.amount;

    try {
      await recordPayment.mutateAsync({
        orderId: order.id,
        key: createIdempotencyKey(),
        method: values.method,
        amount: appliedAmount,
        reference: values.reference,
        notes: values.notes,
        verified: values.verified,
      });
      onPaid?.();

      if (remaining - appliedAmount <= 0) {
        toast({
          title: "Pembayaran lunas",
          description: `${order.orderNumber} sudah dibayar penuh.`,
          tone: "success",
        });
        onOpenChange(false);
      } else {
        toast({
          title: "Pembayaran tercatat",
          description: `Sisa tagihan ${formatCurrency(remaining - appliedAmount)}.`,
          tone: "success",
        });
      }
    } catch (reason) {
      setError("root", {
        message:
          reason instanceof Error
            ? reason.message
            : "Pembayaran gagal dicatat.",
      });
    }
  });

  return (
    <Drawer
      description="Catat pembayaran tunai atau digital. Split payment didukung."
      footer={
        <>
          <Button
            disabled={recordPayment.isPending}
            onClick={() => onOpenChange(false)}
            variant="outline"
          >
            Tutup
          </Button>
          {remaining > 0 ? (
            <Button
              form="pos-payment-form"
              isLoading={recordPayment.isPending}
              type="submit"
            >
              Catat pembayaran
            </Button>
          ) : null}
        </>
      }
      onOpenChange={onOpenChange}
      open={open && order !== null}
      title="Pembayaran"
    >
      {order ? (
        <div className="flex flex-col gap-5">
          <div className="rounded-md border border-border bg-surface-subtle p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col">
                <span className="text-body font-medium text-foreground">
                  {order.orderNumber}
                </span>
                <span className="text-caption text-muted-foreground">
                  {order.orderType === "DINE_IN" ? "Dine-in" : "Takeaway"}
                </span>
              </div>
              <Badge tone={paymentTone}>{paymentLabel}</Badge>
            </div>
            <dl className="mt-3 grid gap-1 text-body">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Total</dt>
                <dd className="tabular-nums">
                  {formatCurrency(order.grandTotal)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Sudah dibayar</dt>
                <dd className="tabular-nums">{formatCurrency(paid)}</dd>
              </div>
              <div className="flex justify-between gap-3 text-card-title text-foreground">
                <dt>Sisa tagihan</dt>
                <dd className="tabular-nums">{formatCurrency(remaining)}</dd>
              </div>
            </dl>
          </div>

          {orderPayments.length > 0 ? (
            <div className="flex flex-col gap-2">
              <p className="text-label font-medium text-foreground">
                Riwayat pembayaran
              </p>
              {orderPayments.map((payment) => (
                <div
                  className="flex items-start justify-between gap-3 rounded-md border border-border p-3 text-body"
                  key={payment.id}
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      {methodLabels[payment.method]}
                    </span>
                    <span className="text-caption text-muted-foreground">
                      {formatDateTime(payment.paidAt)}
                    </span>
                    <span className="text-caption text-muted-foreground">
                      Dicatat oleh {payment.recordedByName ?? "Tidak ada"}
                    </span>
                  </div>
                  <span className="shrink-0 tabular-nums text-foreground">
                    {formatCurrency(payment.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : null}

          {remaining > 0 ? (
            <form
              className="flex flex-col gap-4 border-t border-border pt-4"
              id="pos-payment-form"
              onSubmit={onSubmit}
            >
              <Field
                error={errors.method?.message}
                htmlFor="payment-method"
                label="Metode pembayaran"
                required
              >
                <Select id="payment-method" {...register("method")}>
                  <option value="CASH">Tunai</option>
                  <option value="QRIS">QRIS</option>
                  <option value="TRANSFER">Transfer</option>
                  <option value="E_WALLET">Dompet digital</option>
                </Select>
              </Field>

              <Field
                error={errors.amount?.message}
                htmlFor="payment-amount"
                label={
                  method === "CASH" ? "Uang diterima" : "Nominal pembayaran"
                }
                required
              >
                <Input
                  id="payment-amount"
                  min={1}
                  step={1}
                  type="number"
                  {...register("amount", { valueAsNumber: true })}
                />
              </Field>

              {order.cashTendered !== null && paid === 0 ? (
                <p className="text-caption text-muted-foreground">
                  Pelanggan menyiapkan {formatCurrency(order.cashTendered)}.
                  Konfirmasi setelah uang diterima.
                </p>
              ) : null}

              {method === "CASH" ? (
                <div className="flex items-center justify-between rounded-md border border-border bg-surface-subtle px-3 py-2 text-body">
                  <span className="text-muted-foreground">Kembalian</span>
                  <span className="font-medium tabular-nums text-foreground">
                    {formatCurrency(change)}
                  </span>
                </div>
              ) : null}

              <Field
                error={errors.reference?.message}
                htmlFor="payment-reference"
                label="Referensi"
              >
                <Input
                  id="payment-reference"
                  placeholder="Contoh: nomor transaksi QRIS"
                  {...register("reference")}
                />
              </Field>

              <Field
                error={errors.notes?.message}
                htmlFor="payment-notes"
                label="Catatan"
              >
                <Textarea
                  id="payment-notes"
                  placeholder="Catatan pembayaran"
                  {...register("notes")}
                />
              </Field>

              {method !== "CASH" ? (
                <div className="flex flex-col gap-1">
                  <label
                    className="flex min-h-11 items-center gap-2 text-body text-foreground"
                    htmlFor="payment-verified"
                  >
                    <Checkbox
                      aria-describedby={verifiedErrorId}
                      id="payment-verified"
                      {...register("verified")}
                    />
                    Pembayaran digital sudah diverifikasi
                  </label>
                  {errors.verified?.message ? (
                    <p
                      className="text-caption font-medium text-danger-strong"
                      id="payment-verified-error"
                      role="alert"
                    >
                      {errors.verified.message}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <FieldDescription>
                {method === "CASH"
                  ? `Pembayaran dicatat ${formatCurrency(applied)} dan kembalian ${formatCurrency(change)}.`
                  : "Pembayaran digital dicatat manual setelah verifikasi kasir."}
              </FieldDescription>

              {errors.root?.message ? (
                <p
                  className="rounded-md border border-danger/20 bg-danger-subtle px-3 py-2 text-body text-danger-strong"
                  role="alert"
                >
                  {errors.root.message}
                </p>
              ) : null}
            </form>
          ) : (
            <p className="rounded-md border border-success/20 bg-success-subtle px-3 py-2 text-body text-success-strong">
              Pesanan sudah dibayar penuh.
            </p>
          )}
        </div>
      ) : null}
    </Drawer>
  );
}

import "server-only";

import type { AppDatabase } from "@/infrastructure/database/types";
import { formatDateKey } from "@/lib/format";
import { writeAudit } from "@/modules/audit/audit.service";
import { publishRealtime } from "@/modules/events/event-bus";
import { saveIdempotentResponse } from "@/modules/idempotency/idempotency.service";
import {
  findOrder,
  findPayment,
  findRefundByOrder,
  insertPayment,
  insertRefund,
  listOrderRows,
  listPaymentRows,
  markPaymentsRefunded,
  updateOrderRow,
} from "@/modules/orders/order.repository";
import type { PaymentCreateInput } from "@/modules/payments/payment.schemas";
import { listUserRows } from "@/modules/users/user.repository";
import { AppError } from "@/shared/errors/app-error";
import { newId } from "@/shared/ids";
import { pageOf, textMatch } from "@/shared/pagination";
import { now } from "@/shared/time";
import type { Payment, Refund } from "@/types/domain";

type PaymentRow = Awaited<ReturnType<typeof listPaymentRows>>[number];

async function paymentLookup(db: AppDatabase, businessId: string) {
  const orderRows = (await listOrderRows(db)).filter(
    (row) => row.businessId === businessId,
  );
  const users = await listUserRows(db, businessId);

  return {
    orderNumbers: new Map(orderRows.map((row) => [row.id, row.orderNumber])),
    userNames: new Map(users.map((user) => [user.id, user.name])),
    orderRows,
  };
}

function toPayment(
  row: PaymentRow,
  orderNumbers: Map<string, string>,
  userNames: Map<string, string>,
): Payment {
  return {
    id: row.id,
    orderId: row.orderId,
    orderNumber: orderNumbers.get(row.orderId),
    method: row.method,
    amount: row.amount,
    status: row.status,
    reference: row.reference,
    notes: row.notes,
    recordedBy: row.recordedBy,
    recordedByName: userNames.get(row.recordedBy),
    paidAt: row.paidAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listPayments(
  db: AppDatabase,
  businessId: string,
  params: {
    search?: string;
    method?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    pageSize?: number;
  },
) {
  const { orderNumbers, orderRows, userNames } = await paymentLookup(
    db,
    businessId,
  );
  const orderIds = new Set(orderRows.map((row) => row.id));
  const rows = (await listPaymentRows(db))
    .filter(
      (row) =>
        orderIds.has(row.orderId) &&
        (textMatch(orderNumbers.get(row.orderId) ?? "", params.search) ||
          textMatch(row.reference, params.search) ||
          textMatch(row.notes, params.search)) &&
        (!params.method ||
          params.method === "all" ||
          row.method === params.method) &&
        (!params.status ||
          params.status === "all" ||
          row.status === params.status) &&
        (!params.dateFrom || formatDateKey(row.createdAt) >= params.dateFrom) &&
        (!params.dateTo || formatDateKey(row.createdAt) <= params.dateTo),
    )
    .sort(
      (left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
    );

  return pageOf(
    rows.map((row) => toPayment(row, orderNumbers, userNames)),
    params.page,
    params.pageSize,
  );
}

export async function getPayment(
  db: AppDatabase,
  businessId: string,
  id: string,
) {
  const row = await findPayment(db, id);
  const order = row ? await findOrder(db, row.orderId) : null;

  if (!row || !order || order.businessId !== businessId) {
    throw AppError.notFound("PAYMENT_NOT_FOUND", "Pembayaran tidak ditemukan.");
  }

  const { orderNumbers, userNames } = await paymentLookup(db, businessId);

  return toPayment(row, orderNumbers, userNames);
}

export async function listOrderPayments(
  db: AppDatabase,
  businessId: string,
  orderId: string,
) {
  const order = await findOrder(db, orderId);

  if (!order || order.businessId !== businessId) {
    throw AppError.notFound("ORDER_NOT_FOUND", "Pesanan tidak ditemukan.");
  }

  const { orderNumbers, userNames } = await paymentLookup(db, businessId);

  return (await listPaymentRows(db, [orderId])).map((row) =>
    toPayment(row, orderNumbers, userNames),
  );
}

export async function recordPayment(
  db: AppDatabase,
  businessId: string,
  orderId: string,
  input: PaymentCreateInput,
  actorId: string,
  idempotency?: { key: string; hash: string },
) {
  const order = await findOrder(db, orderId);

  if (!order || order.businessId !== businessId) {
    throw AppError.notFound("ORDER_NOT_FOUND", "Pesanan tidak ditemukan.");
  }

  if (order.orderStatus === "CANCELLED" || order.paymentStatus === "REFUNDED") {
    throw AppError.conflict(
      "ORDER_INVALID_STATE",
      "Pesanan tidak dapat menerima pembayaran.",
    );
  }

  if (input.method !== "CASH" && !input.verified) {
    throw AppError.unprocessable(
      "PAYMENT_NOT_VERIFIED",
      "Pembayaran digital harus diverifikasi.",
    );
  }

  const alreadyPaid = (await listPaymentRows(db, [orderId]))
    .filter((row) => row.status === "RECORDED")
    .reduce((total, row) => total + row.amount, 0);
  const remaining = Math.max(0, order.grandTotal - alreadyPaid);

  if (input.amount > remaining) {
    throw AppError.unprocessable(
      "PAYMENT_OVERPAID",
      "Nominal pembayaran melebihi sisa tagihan.",
    );
  }

  const paymentStatus =
    alreadyPaid + input.amount >= order.grandTotal ? "PAID" : "PARTIALLY_PAID";
  const timestamp = now();
  const payment: Payment = {
    id: newId(),
    orderId,
    method: input.method,
    amount: input.amount,
    status: "RECORDED",
    reference: input.reference,
    notes: input.notes,
    recordedBy: actorId,
    paidAt: timestamp.toISOString(),
    createdAt: timestamp.toISOString(),
  };

  await db.transaction(async (tx) => {
    await insertPayment(tx, {
      id: payment.id,
      orderId,
      method: input.method,
      amount: input.amount,
      status: "RECORDED",
      reference: input.reference,
      notes: input.notes,
      recordedBy: actorId,
      paidAt: timestamp,
      createdAt: timestamp,
    });
    await updateOrderRow(tx, orderId, { paymentStatus, updatedAt: timestamp });
    await writeAudit(tx, {
      businessId,
      actorUserId: actorId,
      action: "payment.record",
      resourceType: "payment",
      resourceId: payment.id,
      metadata: { orderId, amount: input.amount, method: input.method },
    });

    if (idempotency) {
      await saveIdempotentResponse(tx, {
        businessId,
        key: idempotency.key,
        operation: "RECORD_PAYMENT",
        hash: idempotency.hash,
        resourceType: "payment",
        resourceId: payment.id,
        status: 201,
        body: payment,
      });
    }
  });

  publishRealtime("payment.status_changed", {
    orderId,
    orderNumber: order.orderNumber,
    paymentStatus,
  });

  return payment;
}

export async function refundOrder(
  db: AppDatabase,
  businessId: string,
  orderId: string,
  reason: string,
  actorId: string,
  idempotency?: { key: string; hash: string },
) {
  const order = await findOrder(db, orderId);

  if (!order || order.businessId !== businessId) {
    throw AppError.notFound("ORDER_NOT_FOUND", "Pesanan tidak ditemukan.");
  }

  const payments = await listPaymentRows(db, [orderId]);

  if (
    order.paymentStatus !== "PAID" ||
    payments.length === 0 ||
    payments.some((row) => row.status !== "RECORDED") ||
    (await findRefundByOrder(db, orderId))
  ) {
    throw AppError.conflict(
      "REFUND_NOT_ALLOWED",
      "Refund hanya untuk pesanan dibayar penuh tanpa refund sebelumnya.",
    );
  }

  const amount = payments.reduce((total, row) => total + row.amount, 0);
  const timestamp = now();
  const refund: Refund = {
    id: newId(),
    orderId,
    amount,
    reason,
    recordedBy: actorId,
    createdAt: timestamp.toISOString(),
  };

  await db.transaction(async (tx) => {
    await insertRefund(tx, { ...refund, createdAt: timestamp });
    await markPaymentsRefunded(tx, orderId);
    await updateOrderRow(tx, orderId, {
      paymentStatus: "REFUNDED",
      updatedAt: timestamp,
    });
    await writeAudit(tx, {
      businessId,
      actorUserId: actorId,
      action: "order.refund",
      resourceType: "refund",
      resourceId: refund.id,
      metadata: { orderId, amount, reason },
    });

    if (idempotency) {
      await saveIdempotentResponse(tx, {
        businessId,
        key: idempotency.key,
        operation: "REFUND_ORDER",
        hash: idempotency.hash,
        resourceType: "refund",
        resourceId: refund.id,
        status: 201,
        body: refund,
      });
    }
  });

  publishRealtime("order.refunded", {
    orderId,
    orderNumber: order.orderNumber,
    paymentStatus: "REFUNDED",
  });

  return refund;
}

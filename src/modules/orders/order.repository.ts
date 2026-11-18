import "server-only";

import { and, eq, inArray } from "drizzle-orm";
import {
  orderItemAddOns,
  orderItems,
  orderStatusHistory,
  orders,
  payments,
  refunds,
} from "@/infrastructure/database/schema";
import type { DbExecutor } from "@/infrastructure/database/types";

export async function listOrderRows(db: DbExecutor) {
  return db.select().from(orders);
}

export async function findOrder(db: DbExecutor, id: string) {
  const rows = await db.select().from(orders).where(eq(orders.id, id)).limit(1);

  return rows[0] ?? null;
}

export async function findOrderByPublicToken(db: DbExecutor, token: string) {
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.publicToken, token))
    .limit(1);

  return rows[0] ?? null;
}

export async function listOrderItemRows(db: DbExecutor, orderIds: string[]) {
  if (orderIds.length === 0) {
    return [];
  }

  return db
    .select()
    .from(orderItems)
    .where(inArray(orderItems.orderId, orderIds));
}

export async function listItemAddOnRows(db: DbExecutor, itemIds: string[]) {
  if (itemIds.length === 0) {
    return [];
  }

  return db
    .select()
    .from(orderItemAddOns)
    .where(inArray(orderItemAddOns.orderItemId, itemIds));
}

export async function insertOrder(
  db: DbExecutor,
  input: typeof orders.$inferInsert,
) {
  await db.insert(orders).values(input);
}

export async function insertOrderItems(
  db: DbExecutor,
  input: (typeof orderItems.$inferInsert)[],
) {
  if (input.length > 0) {
    await db.insert(orderItems).values(input);
  }
}

export async function insertItemAddOns(
  db: DbExecutor,
  input: (typeof orderItemAddOns.$inferInsert)[],
) {
  if (input.length > 0) {
    await db.insert(orderItemAddOns).values(input);
  }
}

export async function insertStatusHistory(
  db: DbExecutor,
  input: typeof orderStatusHistory.$inferInsert,
) {
  await db.insert(orderStatusHistory).values(input);
}

export async function listStatusHistory(db: DbExecutor, orderId: string) {
  return db
    .select()
    .from(orderStatusHistory)
    .where(eq(orderStatusHistory.orderId, orderId));
}

export async function updateOrderRow(
  db: DbExecutor,
  id: string,
  input: Partial<typeof orders.$inferInsert>,
) {
  await db.update(orders).set(input).where(eq(orders.id, id));
}

export async function listPaymentRows(db: DbExecutor, orderIds?: string[]) {
  if (!orderIds) {
    return db.select().from(payments);
  }

  if (orderIds.length === 0) {
    return [];
  }

  return db.select().from(payments).where(inArray(payments.orderId, orderIds));
}

export async function findPayment(db: DbExecutor, id: string) {
  const rows = await db
    .select()
    .from(payments)
    .where(eq(payments.id, id))
    .limit(1);

  return rows[0] ?? null;
}

export async function insertPayment(
  db: DbExecutor,
  input: typeof payments.$inferInsert,
) {
  await db.insert(payments).values(input);
}

export async function markPaymentsRefunded(db: DbExecutor, orderId: string) {
  await db
    .update(payments)
    .set({ status: "REFUNDED" })
    .where(and(eq(payments.orderId, orderId), eq(payments.status, "RECORDED")));
}

export async function findRefundByOrder(db: DbExecutor, orderId: string) {
  const rows = await db
    .select()
    .from(refunds)
    .where(eq(refunds.orderId, orderId))
    .limit(1);

  return rows[0] ?? null;
}

export async function insertRefund(
  db: DbExecutor,
  input: typeof refunds.$inferInsert,
) {
  await db.insert(refunds).values(input);
}

export async function listRefundRows(db: DbExecutor) {
  return db.select().from(refunds);
}

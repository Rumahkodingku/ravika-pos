import "server-only";

import type { AppDatabase } from "@/infrastructure/database/types";
import { DEFAULT_TIME_ZONE, formatDateKey } from "@/lib/format";
import {
  listOrderRows,
  listPaymentRows,
} from "@/modules/orders/order.repository";
import { mapOrders } from "@/modules/orders/order.service";
import type { DashboardSummary, Order, SalesReport } from "@/types/domain";
import type { PreparationStatus } from "@/types/ui";

const queueStatuses: PreparationStatus[] = [
  "NEW",
  "ACCEPTED",
  "PREPARING",
  "READY",
];
const queueLabels: Record<PreparationStatus, string> = {
  NEW: "Baru",
  ACCEPTED: "Diterima",
  PREPARING: "Disiapkan",
  READY: "Siap",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

function dateKeyOffset(daysAgo: number) {
  const date = new Date(`${formatDateKey(new Date())}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return formatDateKey(date);
}

function rangeKeys(range?: string) {
  if (range === "7d") {
    return { from: dateKeyOffset(6), to: dateKeyOffset(0) };
  }
  if (range === "30d") {
    return { from: dateKeyOffset(29), to: dateKeyOffset(0) };
  }
  return { from: dateKeyOffset(0), to: dateKeyOffset(0) };
}

function inRange(value: Date, from: string, to: string) {
  const key = formatDateKey(value);
  return key >= from && key <= to;
}

function buildTopProducts(orders: Order[], limit = 4) {
  const map = new Map<
    string,
    { name: string; quantity: number; revenue: number }
  >();

  for (const order of orders) {
    for (const item of order.items) {
      const current = map.get(item.productName) ?? {
        name: item.productName,
        quantity: 0,
        revenue: 0,
      };
      current.quantity += item.quantity;
      current.revenue += item.lineTotal;
      map.set(item.productName, current);
    }
  }

  return [...map.values()]
    .sort((left, right) => right.quantity - left.quantity)
    .slice(0, limit);
}

function buildTrend(orders: Order[], toKey: string) {
  const end = new Date(`${toKey}T12:00:00Z`);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(end);
    date.setUTCDate(date.getUTCDate() - (6 - index));
    const key = formatDateKey(date);

    return {
      label: new Intl.DateTimeFormat("id-ID", {
        weekday: "short",
        timeZone: DEFAULT_TIME_ZONE,
      }).format(date),
      value: orders
        .filter((order) => formatDateKey(order.createdAt) === key)
        .reduce((total, order) => total + order.grandTotal, 0),
    };
  });
}

async function reportData(
  db: AppDatabase,
  businessId: string,
  from: string,
  to: string,
) {
  const rows = (await listOrderRows(db)).filter(
    (row) =>
      row.businessId === businessId &&
      row.orderStatus !== "CANCELLED" &&
      inRange(row.createdAt, from, to),
  );
  const orders = await mapOrders(db, rows);
  const orderIds = new Set(
    (await listOrderRows(db))
      .filter((row) => row.businessId === businessId)
      .map((row) => row.id),
  );
  const paidTotal = (await listPaymentRows(db))
    .filter(
      (row) =>
        orderIds.has(row.orderId) &&
        row.status === "RECORDED" &&
        inRange(row.createdAt, from, to),
    )
    .reduce((total, row) => total + row.amount, 0);
  const salesTotal = orders.reduce(
    (total, order) => total + order.grandTotal,
    0,
  );

  return { orders, paidTotal, salesTotal };
}

export async function getSummary(
  db: AppDatabase,
  businessId: string,
  range?: string,
): Promise<DashboardSummary> {
  const { from, to } = rangeKeys(range);
  const { orders, paidTotal, salesTotal } = await reportData(
    db,
    businessId,
    from,
    to,
  );
  const transactionCount = orders.length;
  const itemsSold = orders.reduce(
    (total, order) =>
      total + order.items.reduce((sum, item) => sum + item.quantity, 0),
    0,
  );

  return {
    salesTotal,
    paidTotal,
    transactionCount,
    averageTransaction:
      transactionCount > 0 ? Math.round(salesTotal / transactionCount) : 0,
    itemsSold,
    queue: queueStatuses.map((status) => ({
      status,
      label: queueLabels[status],
      count: orders.filter((order) => order.orderStatus === status).length,
    })),
    queueOrders: orders
      .filter((order) => queueStatuses.includes(order.orderStatus))
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
      .slice(0, 4),
    salesTrend: buildTrend(orders, to),
    topProducts: buildTopProducts(orders),
    recentOrders: orders
      .slice()
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .slice(0, 5),
  };
}

export async function getSalesReport(
  db: AppDatabase,
  businessId: string,
  params: { dateFrom?: string; dateTo?: string },
): Promise<SalesReport> {
  const from = params.dateFrom ?? dateKeyOffset(6);
  const to = params.dateTo ?? dateKeyOffset(0);
  const { orders, paidTotal, salesTotal } = await reportData(
    db,
    businessId,
    from,
    to,
  );
  const transactionCount = orders.length;

  return {
    salesTotal,
    paidTotal,
    transactionCount,
    averageTransaction:
      transactionCount > 0 ? Math.round(salesTotal / transactionCount) : 0,
    salesTrend: buildTrend(orders, to),
    topProducts: buildTopProducts(orders),
    orders: orders.sort((left, right) =>
      right.createdAt.localeCompare(left.createdAt),
    ),
  };
}

export async function getTopProducts(
  db: AppDatabase,
  businessId: string,
  params: { dateFrom?: string; dateTo?: string; limit?: number },
) {
  const from = params.dateFrom ?? dateKeyOffset(6);
  const to = params.dateTo ?? dateKeyOffset(0);
  const { orders } = await reportData(db, businessId, from, to);

  return buildTopProducts(orders, Math.min(params.limit ?? 5, 100));
}

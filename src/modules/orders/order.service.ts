import "server-only";

import type { AppDatabase, DbExecutor } from "@/infrastructure/database/types";
import { formatDateKey } from "@/lib/format";
import { writeAudit } from "@/modules/audit/audit.service";
import { getProduct, listAddOns } from "@/modules/catalog/catalog.service";
import { publishRealtime } from "@/modules/events/event-bus";
import type { IdempotencyOperation } from "@/modules/idempotency/idempotency.service";
import { saveIdempotentResponse } from "@/modules/idempotency/idempotency.service";
import {
  countActiveOrdersForTable,
  findTable,
  findTableByTokenHash,
  listTableRows,
  updateTableRow,
} from "@/modules/tables/table.repository";
import { listUserRows } from "@/modules/users/user.repository";
import { AppError } from "@/shared/errors/app-error";
import { hashToken, newId, newToken } from "@/shared/ids";
import { pageOf, textMatch } from "@/shared/pagination";
import { now } from "@/shared/time";
import type {
  Order,
  OrderItem,
  OrderItemAddOn,
  OrderStatusHistory,
} from "@/types/domain";
import {
  findOrder,
  findOrderByPublicToken,
  insertItemAddOns,
  insertOrder,
  insertOrderItems,
  insertStatusHistory,
  listItemAddOnRows,
  listOrderItemRows,
  listOrderRows,
  listPaymentRows,
  listStatusHistory,
  updateOrderRow,
} from "./order.repository";
import type { OrderCreateInput } from "./order.schemas";

const activeStatuses = ["NEW", "ACCEPTED", "PREPARING", "READY"] as const;

function toIso(value: Date) {
  return value.toISOString();
}

export async function mapOrders(
  db: AppDatabase,
  rows: Awaited<ReturnType<typeof listOrderRows>>,
): Promise<Order[]> {
  const items = await listOrderItemRows(
    db,
    rows.map((row) => row.id),
  );
  const addOns = await listItemAddOnRows(
    db,
    items.map((item) => item.id),
  );
  const tables = await listTableRows(db);
  const users = rows[0] ? await listUserRows(db, rows[0].businessId) : [];

  return rows.map((row) => ({
    id: row.id,
    businessId: row.businessId,
    orderNumber: row.orderNumber,
    orderType: row.orderType,
    source: row.source,
    tableId: row.tableId,
    tableName: tables.find((table) => table.id === row.tableId)?.name ?? null,
    createdByName:
      users.find((user) => user.id === row.createdBy)?.name ?? null,
    orderStatus: row.orderStatus,
    paymentStatus: row.paymentStatus,
    publicToken: row.publicToken,
    subtotal: row.subtotal,
    grandTotal: row.grandTotal,
    cashTendered: row.cashTendered,
    notes: row.notes,
    createdBy: row.createdBy,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
    items: items
      .filter((item) => item.orderId === row.id)
      .map(
        (item): OrderItem => ({
          id: item.id,
          productId: item.productId,
          productName: item.productNameSnapshot,
          variantName: item.variantNameSnapshot,
          quantity: item.quantity,
          unitPrice: item.unitPriceSnapshot + item.addOnTotalSnapshot,
          lineTotal: item.lineTotal,
          notes: item.notes,
          addOns: addOns
            .filter((addOn) => addOn.orderItemId === item.id)
            .map(
              (addOn): OrderItemAddOn => ({
                id: addOn.id,
                addOnId: addOn.addOnId,
                name: addOn.addOnNameSnapshot,
                price: addOn.priceSnapshot,
                quantity: addOn.quantity,
              }),
            ),
        }),
      ),
  }));
}

export async function getOrder(
  db: AppDatabase,
  businessId: string,
  id: string,
) {
  const row = await findOrder(db, id);

  if (!row || row.businessId !== businessId) {
    throw AppError.notFound("ORDER_NOT_FOUND", "Pesanan tidak ditemukan.");
  }

  return (await mapOrders(db, [row]))[0];
}

export async function getOrderByPublicToken(db: AppDatabase, token: string) {
  const row = await findOrderByPublicToken(db, token);

  if (!row) {
    throw AppError.notFound("ORDER_NOT_FOUND", "Pesanan tidak ditemukan.");
  }

  return (await mapOrders(db, [row]))[0];
}

export async function getOrderHistory(
  db: AppDatabase,
  businessId: string,
  id: string,
): Promise<OrderStatusHistory[]> {
  const row = await findOrder(db, id);

  if (!row || row.businessId !== businessId) {
    throw AppError.notFound("ORDER_NOT_FOUND", "Pesanan tidak ditemukan.");
  }

  const users = await listUserRows(db, businessId);
  const userNames = new Map(users.map((user) => [user.id, user.name]));

  return (await listStatusHistory(db, id)).map((history) => ({
    id: history.id,
    orderId: history.orderId,
    previousStatus: history.previousStatus,
    newStatus: history.newStatus,
    changedBy: history.changedBy,
    changedByName: history.changedBy
      ? userNames.get(history.changedBy)
      : undefined,
    reason: history.reason,
    createdAt: toIso(history.createdAt),
  }));
}

export async function listOrders(
  db: AppDatabase,
  businessId: string,
  params: {
    search?: string;
    orderStatus?: string;
    paymentStatus?: string;
    dateFrom?: string;
    dateTo?: string;
    sortDir?: "asc" | "desc";
    page?: number;
    pageSize?: number;
  },
) {
  const rows = (await listOrderRows(db))
    .filter(
      (row) =>
        row.businessId === businessId &&
        textMatch(row.orderNumber, params.search) &&
        (!params.orderStatus ||
          params.orderStatus === "all" ||
          row.orderStatus === params.orderStatus) &&
        (!params.paymentStatus ||
          params.paymentStatus === "all" ||
          row.paymentStatus === params.paymentStatus) &&
        (!params.dateFrom || formatDateKey(row.createdAt) >= params.dateFrom) &&
        (!params.dateTo || formatDateKey(row.createdAt) <= params.dateTo),
    )
    .sort((left, right) =>
      params.sortDir === "asc"
        ? left.createdAt.getTime() - right.createdAt.getTime()
        : right.createdAt.getTime() - left.createdAt.getTime(),
    );

  const items = await mapOrders(db, rows);
  return pageOf(items, params.page, params.pageSize);
}

export async function listPayableOrders(db: AppDatabase, businessId: string) {
  const rows = (await listOrderRows(db))
    .filter(
      (row) =>
        row.businessId === businessId &&
        row.orderStatus !== "CANCELLED" &&
        (row.paymentStatus === "UNPAID" ||
          row.paymentStatus === "PARTIALLY_PAID"),
    )
    .sort(
      (left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
    );

  return mapOrders(db, rows);
}

async function orderNumber(db: AppDatabase) {
  const highest = (await listOrderRows(db))
    .map((row) => Number.parseInt(row.orderNumber.split("-").at(-1) ?? "", 10))
    .filter((value) => Number.isFinite(value))
    .reduce((max, value) => Math.max(max, value), 2000);

  return `RVK-${highest + 1}`;
}

async function buildItems(
  db: AppDatabase,
  businessId: string,
  items: OrderCreateInput["items"],
) {
  const addOns = await listAddOns(db, businessId);
  const addOnById = new Map(addOns.map((addOn) => [addOn.id, addOn]));

  return Promise.all(
    items.map(async (input, index) => {
      const product = await getProduct(db, businessId, input.productId);

      if (!product.isActive || !product.isAvailable) {
        throw AppError.conflict(
          "PRODUCT_UNAVAILABLE",
          `${product.name} tidak tersedia.`,
        );
      }

      const activeVariants = product.variants.filter(
        (variant) => variant.isActive,
      );
      let variant = null;

      if (activeVariants.length > 0) {
        variant =
          activeVariants.find(
            (candidate) => candidate.id === input.variantId,
          ) ?? null;

        if (!variant) {
          throw AppError.validation([
            {
              path: `items.${index}.variantId`,
              message: "Varian wajib dipilih.",
            },
          ]);
        }
      } else if (input.variantId) {
        throw AppError.validation([
          {
            path: `items.${index}.variantId`,
            message: "Produk tidak memiliki varian.",
          },
        ]);
      }

      const selectedIds = [...new Set(input.addOnIds)];
      const selected = selectedIds.map((addOnId) => {
        const addOn = addOnById.get(addOnId);
        const relation = product.addOns.find(
          (candidate) => candidate.addOnId === addOnId,
        );

        if (!addOn || !addOn.isActive || !relation) {
          throw AppError.validation([
            {
              path: `items.${index}.addOnIds`,
              message: "Add-on tidak valid.",
            },
          ]);
        }

        return { addOn, relation };
      });

      for (const relation of product.addOns) {
        const count = selectedIds.filter(
          (addOnId) => addOnId === relation.addOnId,
        ).length;

        if (relation.isRequired && count === 0) {
          throw AppError.validation([
            {
              path: `items.${index}.addOnIds`,
              message: `Add-on wajib untuk ${product.name} belum dipilih.`,
            },
          ]);
        }
        if (count < relation.minSelection || count > relation.maxSelection) {
          throw AppError.validation([
            {
              path: `items.${index}.addOnIds`,
              message: `Jumlah add-on ${product.name} tidak valid.`,
            },
          ]);
        }
      }

      const addOnTotal = selected.reduce(
        (total, item) => total + item.addOn.price,
        0,
      );
      const unitPrice =
        product.basePrice + (variant?.priceAdjustment ?? 0) + addOnTotal;
      const lineTotal = unitPrice * input.quantity;

      return {
        id: newId(),
        productId: product.id,
        productName: product.name,
        variantName: variant?.name ?? null,
        quantity: input.quantity,
        unitPrice,
        addOnTotal,
        lineTotal,
        notes: input.notes,
        addOns: selected.map(({ addOn }) => ({
          id: newId(),
          addOnId: addOn.id,
          name: addOn.name,
          price: addOn.price,
          quantity: 1,
        })),
      };
    }),
  );
}

async function createOrderInternal(
  db: AppDatabase,
  businessId: string,
  input: OrderCreateInput,
  source: "CASHIER" | "QR",
  createdBy: string | null,
  options: {
    tableToken?: string;
    publicToken?: boolean;
    publicResponse?: boolean;
    cashTendered?: number | null;
    idempotency?: {
      key: string;
      hash: string;
      operation: IdempotencyOperation;
    };
  },
) {
  let tableId = input.tableId;

  if (source === "QR") {
    const table = options.tableToken
      ? await findTableByTokenHash(db, hashToken(options.tableToken))
      : null;

    if (!table || !table.isActive || table.status === "INACTIVE") {
      throw AppError.notFound(
        "QR_TOKEN_INVALID",
        "Token QR tidak valid atau meja tidak aktif.",
      );
    }

    tableId = table.id;
  }

  if (input.orderType === "DINE_IN" && !tableId) {
    throw AppError.validation([
      { path: "tableId", message: "Meja wajib dipilih." },
    ]);
  }
  if (input.orderType === "TAKEAWAY" && tableId) {
    throw AppError.validation([
      { path: "tableId", message: "Takeaway tidak memakai meja." },
    ]);
  }
  if (source === "QR" && input.orderType !== "DINE_IN") {
    throw AppError.validation([
      { path: "orderType", message: "QR hanya untuk dine-in." },
    ]);
  }

  const table = tableId ? await findTable(db, tableId) : null;

  if (tableId && (!table || !table.isActive || table.status === "INACTIVE")) {
    throw AppError.conflict("TABLE_NOT_AVAILABLE", "Meja tidak tersedia.");
  }

  const items = await buildItems(db, businessId, input.items);
  const subtotal = items.reduce((total, item) => total + item.lineTotal, 0);
  const cashTendered = options.cashTendered ?? null;

  if (cashTendered !== null && cashTendered < subtotal) {
    throw AppError.validation([
      {
        path: "cashTendered",
        message: "Nominal tunai kurang dari total pesanan.",
      },
    ]);
  }

  const timestamp = now();
  const orderId = newId();
  const orderNumberValue = await orderNumber(db);
  const publicToken = options.publicToken ? newToken() : null;
  const orderBody: Order = {
    id: orderId,
    businessId,
    orderNumber: orderNumberValue,
    orderType: input.orderType,
    source,
    tableId,
    tableName: table?.name ?? null,
    orderStatus: "NEW",
    paymentStatus: "UNPAID",
    publicToken,
    subtotal,
    grandTotal: subtotal,
    cashTendered,
    notes: input.notes,
    createdBy,
    createdAt: timestamp.toISOString(),
    updatedAt: timestamp.toISOString(),
    items: items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      variantName: item.variantName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
      notes: item.notes,
      addOns: item.addOns,
    })),
  };

  await db.transaction(async (tx) => {
    await insertOrder(tx, {
      id: orderId,
      businessId,
      orderNumber: orderNumberValue,
      orderType: input.orderType,
      source,
      tableId,
      orderStatus: "NEW",
      paymentStatus: "UNPAID",
      publicToken,
      subtotal,
      discountTotal: 0,
      grandTotal: subtotal,
      cashTendered,
      notes: input.notes,
      createdBy,
      idempotencyKey: options.idempotency?.key ?? null,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    await insertOrderItems(
      tx,
      items.map((item) => ({
        id: item.id,
        orderId,
        productId: item.productId,
        productNameSnapshot: item.productName,
        variantNameSnapshot: item.variantName,
        quantity: item.quantity,
        unitPriceSnapshot: item.unitPrice - (item.addOnTotal ?? 0),
        addOnTotalSnapshot: item.addOnTotal,
        lineTotal: item.lineTotal,
        notes: item.notes,
      })),
    );

    await insertItemAddOns(
      tx,
      items.flatMap((item) =>
        item.addOns.map((addOn) => ({
          id: addOn.id,
          orderItemId: item.id,
          addOnId: addOn.addOnId,
          addOnNameSnapshot: addOn.name,
          priceSnapshot: addOn.price,
          quantity: addOn.quantity,
        })),
      ),
    );

    await insertStatusHistory(tx, {
      id: newId(),
      orderId,
      previousStatus: null,
      newStatus: "NEW",
      changedBy: createdBy,
      reason: "",
      createdAt: timestamp,
    });

    if (tableId) {
      await updateTableRow(tx, tableId, {
        status: "OCCUPIED",
        updatedAt: timestamp,
      });
    }

    await writeAudit(tx, {
      businessId,
      actorUserId: createdBy,
      action: "order.create",
      resourceType: "order",
      resourceId: orderId,
      metadata: { orderNumber: orderNumberValue, source },
    });

    if (options.idempotency) {
      await saveIdempotentResponse(tx, {
        businessId,
        key: options.idempotency.key,
        operation: options.idempotency.operation,
        hash: options.idempotency.hash,
        resourceType: "order",
        resourceId: orderId,
        status: 201,
        body: options.publicResponse
          ? {
              orderNumber: orderNumberValue,
              publicToken,
              grandTotal: subtotal,
              cashTendered,
              tableName: table?.name ?? null,
            }
          : orderBody,
      });
    }
  });

  publishRealtime("order.created", {
    orderId,
    orderNumber: orderNumberValue,
    orderStatus: "NEW",
    paymentStatus: "UNPAID",
    source,
    tableId,
    tableName: table?.name ?? null,
  });

  return getOrder(db, businessId, orderId);
}

export function createOrder(
  db: AppDatabase,
  businessId: string,
  input: OrderCreateInput,
  createdBy: string,
  idempotency?: {
    key: string;
    hash: string;
  },
) {
  return createOrderInternal(db, businessId, input, "CASHIER", createdBy, {
    idempotency: idempotency
      ? { ...idempotency, operation: "CREATE_ORDER" }
      : undefined,
  });
}

export function createPublicOrder(
  db: AppDatabase,
  businessId: string,
  input: OrderCreateInput & { cashTendered: number | null },
  tableToken: string,
  idempotency?: {
    key: string;
    hash: string;
  },
) {
  return createOrderInternal(db, businessId, input, "QR", null, {
    tableToken,
    publicToken: true,
    publicResponse: true,
    cashTendered: input.cashTendered,
    idempotency: idempotency
      ? { ...idempotency, operation: "CREATE_PUBLIC_ORDER" }
      : undefined,
  });
}

export async function syncTableStatus(db: DbExecutor, tableId: string) {
  const table = await findTable(db, tableId);

  if (!table || table.status === "INACTIVE") {
    return;
  }

  const active = await countActiveOrdersForTable(db, tableId);

  await updateTableRow(db, tableId, {
    status: active > 0 ? "OCCUPIED" : "AVAILABLE",
    updatedAt: now(),
  });
}

export async function cancelOrder(
  db: AppDatabase,
  businessId: string,
  id: string,
  reason: string,
  actorId: string,
) {
  const row = await findOrder(db, id);

  if (!row || row.businessId !== businessId) {
    throw AppError.notFound("ORDER_NOT_FOUND", "Pesanan tidak ditemukan.");
  }

  if (!["NEW", "ACCEPTED", "PREPARING"].includes(row.orderStatus)) {
    throw AppError.conflict(
      "ORDER_INVALID_STATE",
      "Pesanan tidak dapat dibatalkan pada status ini.",
    );
  }

  const recorded = (await listPaymentRows(db, [id])).some(
    (payment) => payment.status === "RECORDED",
  );

  if (recorded) {
    throw AppError.conflict(
      "ORDER_INVALID_STATE",
      "Pesanan dengan pembayaran tercatat tidak dapat dibatalkan.",
    );
  }

  const timestamp = now();

  await db.transaction(async (tx) => {
    await updateOrderRow(tx, id, {
      orderStatus: "CANCELLED",
      cancelledAt: timestamp,
      updatedAt: timestamp,
    });
    await insertStatusHistory(tx, {
      id: newId(),
      orderId: id,
      previousStatus: row.orderStatus,
      newStatus: "CANCELLED",
      changedBy: actorId,
      reason,
      createdAt: timestamp,
    });
    if (row.tableId) {
      await syncTableStatus(tx, row.tableId);
    }
    await writeAudit(tx, {
      businessId,
      actorUserId: actorId,
      action: "order.cancel",
      resourceType: "order",
      resourceId: id,
      metadata: { reason },
    });
  });

  publishRealtime("order.status_changed", {
    orderId: id,
    orderNumber: row.orderNumber,
    orderStatus: "CANCELLED",
    paymentStatus: row.paymentStatus,
  });

  return getOrder(db, businessId, id);
}

export async function updateKdsStatus(
  db: AppDatabase,
  businessId: string,
  id: string,
  nextStatus: "ACCEPTED" | "PREPARING" | "READY" | "COMPLETED",
  actorId: string,
) {
  const row = await findOrder(db, id);

  if (!row || row.businessId !== businessId) {
    throw AppError.notFound("ORDER_NOT_FOUND", "Pesanan tidak ditemukan.");
  }

  const allowed: Record<string, string> = {
    NEW: "ACCEPTED",
    ACCEPTED: "PREPARING",
    PREPARING: "READY",
    READY: "COMPLETED",
  };

  if (allowed[row.orderStatus] !== nextStatus) {
    throw AppError.conflict(
      "KDS_TRANSITION_INVALID",
      "Transisi status pesanan tidak valid.",
    );
  }

  const timestamp = now();

  await db.transaction(async (tx) => {
    await updateOrderRow(tx, id, {
      orderStatus: nextStatus,
      completedAt: nextStatus === "COMPLETED" ? timestamp : row.completedAt,
      updatedAt: timestamp,
    });
    await insertStatusHistory(tx, {
      id: newId(),
      orderId: id,
      previousStatus: row.orderStatus,
      newStatus: nextStatus,
      changedBy: actorId,
      reason: "",
      createdAt: timestamp,
    });
    if (row.tableId) {
      await syncTableStatus(tx, row.tableId);
    }
    await writeAudit(tx, {
      businessId,
      actorUserId: actorId,
      action: "order.status_change",
      resourceType: "order",
      resourceId: id,
      metadata: { from: row.orderStatus, to: nextStatus },
    });
  });

  publishRealtime("order.status_changed", {
    orderId: id,
    orderNumber: row.orderNumber,
    orderStatus: nextStatus,
    paymentStatus: row.paymentStatus,
  });

  return getOrder(db, businessId, id);
}

export async function listKdsOrders(db: AppDatabase, businessId: string) {
  const rows = (await listOrderRows(db))
    .filter((row) => row.businessId === businessId)
    .sort(
      (left, right) => left.createdAt.getTime() - right.createdAt.getTime(),
    );
  const active = rows.filter((row) =>
    activeStatuses.includes(row.orderStatus as (typeof activeStatuses)[number]),
  );
  const completed = rows
    .filter((row) => row.orderStatus === "COMPLETED")
    .sort((left, right) => right.updatedAt.getTime() - left.updatedAt.getTime())
    .slice(0, 10);

  return {
    active: await mapOrders(db, active),
    completed: await mapOrders(db, completed),
  };
}

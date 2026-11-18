import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { users } from "./access";
import { business } from "./business";
import { addOns, products } from "./catalog";

export const orderStatuses = [
  "NEW",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "COMPLETED",
  "CANCELLED",
] as const;

export const paymentStatuses = [
  "UNPAID",
  "PARTIALLY_PAID",
  "PAID",
  "REFUNDED",
] as const;

export const tableStatuses = ["AVAILABLE", "OCCUPIED", "INACTIVE"] as const;

export const diningTables = sqliteTable(
  "tables",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull().unique(),
    status: text("status", { enum: tableStatuses })
      .notNull()
      .default("AVAILABLE"),
    qrTokenHash: text("qr_token_hash").notNull().unique(),
    qrTokenCiphertext: text("qr_token_ciphertext"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    check(
      "tables_status_check",
      sql`${table.status} IN ('AVAILABLE', 'OCCUPIED', 'INACTIVE')`,
    ),
  ],
);

export const orders = sqliteTable(
  "orders",
  {
    id: text("id").primaryKey(),
    businessId: text("business_id")
      .notNull()
      .references(() => business.id, { onDelete: "restrict" }),
    orderNumber: text("order_number").notNull().unique(),
    orderType: text("order_type", { enum: ["DINE_IN", "TAKEAWAY"] }).notNull(),
    source: text("source", { enum: ["CASHIER", "QR"] }).notNull(),
    tableId: text("table_id").references(() => diningTables.id, {
      onDelete: "restrict",
    }),
    orderStatus: text("order_status", { enum: orderStatuses })
      .notNull()
      .default("NEW"),
    paymentStatus: text("payment_status", { enum: paymentStatuses })
      .notNull()
      .default("UNPAID"),
    publicToken: text("public_token").unique(),
    subtotal: integer("subtotal").notNull().default(0),
    discountTotal: integer("discount_total").notNull().default(0),
    grandTotal: integer("grand_total").notNull().default(0),
    notes: text("notes").notNull().default(""),
    createdBy: text("created_by").references(() => users.id, {
      onDelete: "restrict",
    }),
    idempotencyKey: text("idempotency_key").unique(),
    completedAt: integer("completed_at", { mode: "timestamp_ms" }),
    cancelledAt: integer("cancelled_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("orders_business_id_idx").on(table.businessId),
    index("orders_created_at_idx").on(table.createdAt),
    index("orders_order_status_idx").on(table.orderStatus),
    index("orders_payment_status_idx").on(table.paymentStatus),
    index("orders_table_id_idx").on(table.tableId),
    check(
      "orders_status_check",
      sql`${table.orderStatus} IN ('NEW', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED')`,
    ),
    check(
      "orders_payment_status_check",
      sql`${table.paymentStatus} IN ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'REFUNDED')`,
    ),
    check(
      "orders_type_table_check",
      sql`(${table.orderType} = 'TAKEAWAY' AND ${table.tableId} IS NULL) OR (${table.orderType} = 'DINE_IN' AND ${table.tableId} IS NOT NULL)`,
    ),
    check("orders_subtotal_check", sql`${table.subtotal} >= 0`),
    check("orders_discount_check", sql`${table.discountTotal} >= 0`),
    check("orders_grand_total_check", sql`${table.grandTotal} >= 0`),
  ],
);

export const orderItems = sqliteTable(
  "order_items",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: text("product_id").references(() => products.id, {
      onDelete: "restrict",
    }),
    productNameSnapshot: text("product_name_snapshot").notNull(),
    variantNameSnapshot: text("variant_name_snapshot"),
    quantity: integer("quantity").notNull(),
    unitPriceSnapshot: integer("unit_price_snapshot").notNull(),
    addOnTotalSnapshot: integer("add_on_total_snapshot").notNull().default(0),
    lineTotal: integer("line_total").notNull(),
    notes: text("notes").notNull().default(""),
  },
  (table) => [
    index("order_items_order_id_idx").on(table.orderId),
    check("order_items_quantity_check", sql`${table.quantity} >= 1`),
    check("order_items_unit_price_check", sql`${table.unitPriceSnapshot} >= 0`),
    check(
      "order_items_add_on_total_check",
      sql`${table.addOnTotalSnapshot} >= 0`,
    ),
    check("order_items_line_total_check", sql`${table.lineTotal} >= 0`),
  ],
);

export const orderItemAddOns = sqliteTable(
  "order_item_add_ons",
  {
    id: text("id").primaryKey(),
    orderItemId: text("order_item_id")
      .notNull()
      .references(() => orderItems.id, { onDelete: "cascade" }),
    addOnId: text("add_on_id").references(() => addOns.id, {
      onDelete: "restrict",
    }),
    addOnNameSnapshot: text("add_on_name_snapshot").notNull(),
    priceSnapshot: integer("price_snapshot").notNull(),
    quantity: integer("quantity").notNull().default(1),
  },
  (table) => [
    index("order_item_add_ons_order_item_id_idx").on(table.orderItemId),
    check("order_item_add_ons_price_check", sql`${table.priceSnapshot} >= 0`),
    check("order_item_add_ons_quantity_check", sql`${table.quantity} >= 1`),
  ],
);

export const payments = sqliteTable(
  "payments",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    method: text("method", {
      enum: ["CASH", "QRIS", "TRANSFER", "E_WALLET"],
    }).notNull(),
    amount: integer("amount").notNull(),
    status: text("status", { enum: ["RECORDED", "REFUNDED"] })
      .notNull()
      .default("RECORDED"),
    reference: text("reference").notNull().default(""),
    notes: text("notes").notNull().default(""),
    recordedBy: text("recorded_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    paidAt: integer("paid_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("payments_order_id_idx").on(table.orderId),
    index("payments_paid_at_idx").on(table.paidAt),
    check("payments_amount_check", sql`${table.amount} > 0`),
    check(
      "payments_status_check",
      sql`${table.status} IN ('RECORDED', 'REFUNDED')`,
    ),
  ],
);

export const orderStatusHistory = sqliteTable(
  "order_status_history",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    previousStatus: text("previous_status", { enum: orderStatuses }),
    newStatus: text("new_status", { enum: orderStatuses }).notNull(),
    changedBy: text("changed_by").references(() => users.id, {
      onDelete: "restrict",
    }),
    reason: text("reason").notNull().default(""),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("order_status_history_order_id_idx").on(table.orderId),
    index("order_status_history_created_at_idx").on(table.createdAt),
  ],
);

export const refunds = sqliteTable(
  "refunds",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .unique()
      .references(() => orders.id, { onDelete: "restrict" }),
    amount: integer("amount").notNull(),
    reason: text("reason").notNull(),
    recordedBy: text("recorded_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [check("refunds_amount_check", sql`${table.amount} > 0`)],
);

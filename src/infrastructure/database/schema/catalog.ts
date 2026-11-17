import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { business } from "./business";

export const categories = sqliteTable(
  "categories",
  {
    id: text("id").primaryKey(),
    businessId: text("business_id")
      .notNull()
      .references(() => business.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("categories_business_id_idx").on(table.businessId),
    index("categories_sort_order_idx").on(table.sortOrder),
  ],
);

export const products = sqliteTable(
  "products",
  {
    id: text("id").primaryKey(),
    businessId: text("business_id")
      .notNull()
      .references(() => business.id, { onDelete: "restrict" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    imagePath: text("image_path"),
    basePrice: integer("base_price").notNull(),
    isAvailable: integer("is_available", { mode: "boolean" })
      .notNull()
      .default(true),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("products_business_id_idx").on(table.businessId),
    index("products_category_id_idx").on(table.categoryId),
    check("products_base_price_check", sql`${table.basePrice} >= 0`),
  ],
);

export const productVariants = sqliteTable(
  "product_variants",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    priceAdjustment: integer("price_adjustment").notNull().default(0),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  },
  (table) => [
    uniqueIndex("product_variants_product_name_unique").on(
      table.productId,
      table.name,
    ),
    index("product_variants_product_id_idx").on(table.productId),
  ],
);

export const addOns = sqliteTable(
  "add_ons",
  {
    id: text("id").primaryKey(),
    businessId: text("business_id")
      .notNull()
      .references(() => business.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    price: integer("price").notNull(),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("add_ons_business_id_idx").on(table.businessId),
    check("add_ons_price_check", sql`${table.price} >= 0`),
  ],
);

export const productAddOns = sqliteTable(
  "product_add_ons",
  {
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    addOnId: text("add_on_id")
      .notNull()
      .references(() => addOns.id, { onDelete: "restrict" }),
    isRequired: integer("is_required", { mode: "boolean" })
      .notNull()
      .default(false),
    minSelection: integer("min_selection").notNull().default(0),
    maxSelection: integer("max_selection").notNull().default(1),
  },
  (table) => [
    primaryKey({ columns: [table.productId, table.addOnId] }),
    check("product_add_ons_min_check", sql`${table.minSelection} >= 0`),
    check("product_add_ons_max_check", sql`${table.maxSelection} >= 1`),
    check(
      "product_add_ons_range_check",
      sql`${table.minSelection} <= ${table.maxSelection}`,
    ),
  ],
);

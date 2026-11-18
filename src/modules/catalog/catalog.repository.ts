import "server-only";

import { and, eq, inArray } from "drizzle-orm";
import {
  addOns,
  categories,
  productAddOns,
  products,
  productVariants,
} from "@/infrastructure/database/schema";
import type { DbExecutor } from "@/infrastructure/database/types";

export async function listCategoryRows(db: DbExecutor, businessId: string) {
  return db
    .select()
    .from(categories)
    .where(eq(categories.businessId, businessId));
}

export async function findCategory(
  db: DbExecutor,
  businessId: string,
  id: string,
) {
  const rows = await db
    .select()
    .from(categories)
    .where(and(eq(categories.id, id), eq(categories.businessId, businessId)))
    .limit(1);

  return rows[0] ?? null;
}

export async function insertCategory(
  db: DbExecutor,
  input: typeof categories.$inferInsert,
) {
  await db.insert(categories).values(input);
}

export async function updateCategoryRow(
  db: DbExecutor,
  id: string,
  input: Partial<typeof categories.$inferInsert>,
) {
  await db.update(categories).set(input).where(eq(categories.id, id));
}

export async function listProductRows(db: DbExecutor, businessId: string) {
  return db.select().from(products).where(eq(products.businessId, businessId));
}

export async function findProduct(
  db: DbExecutor,
  businessId: string,
  id: string,
) {
  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.id, id), eq(products.businessId, businessId)))
    .limit(1);

  return rows[0] ?? null;
}

export async function listVariantRows(db: DbExecutor, productIds: string[]) {
  if (productIds.length === 0) {
    return [];
  }

  return db
    .select()
    .from(productVariants)
    .where(inArray(productVariants.productId, productIds));
}

export async function listProductAddOnRows(
  db: DbExecutor,
  productIds: string[],
) {
  if (productIds.length === 0) {
    return [];
  }

  return db
    .select()
    .from(productAddOns)
    .where(inArray(productAddOns.productId, productIds));
}

export async function listAddOnRows(db: DbExecutor, businessId: string) {
  return db.select().from(addOns).where(eq(addOns.businessId, businessId));
}

export async function findAddOn(
  db: DbExecutor,
  businessId: string,
  id: string,
) {
  const rows = await db
    .select()
    .from(addOns)
    .where(and(eq(addOns.id, id), eq(addOns.businessId, businessId)))
    .limit(1);

  return rows[0] ?? null;
}

export async function insertProduct(
  db: DbExecutor,
  input: typeof products.$inferInsert,
) {
  await db.insert(products).values(input);
}

export async function updateProductRow(
  db: DbExecutor,
  id: string,
  input: Partial<typeof products.$inferInsert>,
) {
  await db.update(products).set(input).where(eq(products.id, id));
}

export async function deleteVariants(db: DbExecutor, productId: string) {
  await db
    .delete(productVariants)
    .where(eq(productVariants.productId, productId));
}

export async function insertVariants(
  db: DbExecutor,
  input: (typeof productVariants.$inferInsert)[],
) {
  if (input.length > 0) {
    await db.insert(productVariants).values(input);
  }
}

export async function deleteProductAddOns(db: DbExecutor, productId: string) {
  await db.delete(productAddOns).where(eq(productAddOns.productId, productId));
}

export async function insertProductAddOns(
  db: DbExecutor,
  input: (typeof productAddOns.$inferInsert)[],
) {
  if (input.length > 0) {
    await db.insert(productAddOns).values(input);
  }
}

import "server-only";

import { eq, inArray } from "drizzle-orm";
import { productImages } from "@/infrastructure/database/schema";
import type { DbExecutor } from "@/infrastructure/database/types";

export async function upsertProductImage(
  db: DbExecutor,
  input: typeof productImages.$inferInsert,
) {
  await db
    .insert(productImages)
    .values(input)
    .onConflictDoUpdate({
      target: productImages.productId,
      set: {
        checksum: input.checksum,
        data: input.data,
        fileSize: input.fileSize,
        mimeType: input.mimeType,
        updatedAt: input.updatedAt,
      },
    });
}

export async function findProductImage(db: DbExecutor, productId: string) {
  const rows = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, productId))
    .limit(1);

  return rows[0] ?? null;
}

export async function listProductImages(db: DbExecutor, productIds: string[]) {
  if (productIds.length === 0) {
    return [];
  }

  return db
    .select()
    .from(productImages)
    .where(inArray(productImages.productId, productIds));
}

export async function deleteProductImage(db: DbExecutor, productId: string) {
  await db.delete(productImages).where(eq(productImages.productId, productId));
}

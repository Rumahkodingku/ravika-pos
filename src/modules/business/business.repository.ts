import "server-only";

import { eq } from "drizzle-orm";
import { business } from "@/infrastructure/database/schema";
import type { DbExecutor } from "@/infrastructure/database/types";

export async function findBusinessById(db: DbExecutor, id: string) {
  const rows = await db
    .select()
    .from(business)
    .where(eq(business.id, id))
    .limit(1);

  return rows[0] ?? null;
}

export async function findBusinessByCode(db: DbExecutor, code: string) {
  const rows = await db
    .select()
    .from(business)
    .where(eq(business.code, code))
    .limit(1);

  return rows[0] ?? null;
}

export async function updateBusiness(
  db: DbExecutor,
  id: string,
  input: {
    name: string;
    code: string;
    address: string;
    phone: string;
  },
) {
  await db
    .update(business)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(business.id, id));
}

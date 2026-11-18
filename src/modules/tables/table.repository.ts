import "server-only";

import { and, eq, inArray } from "drizzle-orm";
import { diningTables, orders } from "@/infrastructure/database/schema";
import type { DbExecutor } from "@/infrastructure/database/types";

const activeStatuses = ["NEW", "ACCEPTED", "PREPARING", "READY"] as const;

export async function listTableRows(db: DbExecutor) {
  return db.select().from(diningTables);
}

export async function findTableByName(
  db: DbExecutor,
  name: string,
  exceptId?: string,
) {
  const rows = await db.select().from(diningTables);
  return (
    rows.find(
      (row) => row.name === name && (!exceptId || row.id !== exceptId),
    ) ?? null
  );
}

export async function findTable(db: DbExecutor, id: string) {
  const rows = await db
    .select()
    .from(diningTables)
    .where(eq(diningTables.id, id))
    .limit(1);

  return rows[0] ?? null;
}

export async function findTableByTokenHash(db: DbExecutor, hash: string) {
  const rows = await db
    .select()
    .from(diningTables)
    .where(eq(diningTables.qrTokenHash, hash))
    .limit(1);

  return rows[0] ?? null;
}

export async function insertTable(
  db: DbExecutor,
  input: typeof diningTables.$inferInsert,
) {
  await db.insert(diningTables).values(input);
}

export async function updateTableRow(
  db: DbExecutor,
  id: string,
  input: Partial<typeof diningTables.$inferInsert>,
) {
  await db.update(diningTables).set(input).where(eq(diningTables.id, id));
}

export async function listActiveTableOrderRows(db: DbExecutor) {
  return db
    .select({ tableId: orders.tableId })
    .from(orders)
    .where(inArray(orders.orderStatus, [...activeStatuses]));
}

export async function countActiveOrdersForTable(
  db: DbExecutor,
  tableId: string,
) {
  const rows = await db
    .select({ id: orders.id })
    .from(orders)
    .where(
      and(
        eq(orders.tableId, tableId),
        inArray(orders.orderStatus, [...activeStatuses]),
      ),
    );

  return rows.length;
}

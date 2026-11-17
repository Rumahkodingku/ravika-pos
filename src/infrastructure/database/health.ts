import "server-only";

import { sql } from "drizzle-orm";
import type { AppDatabase } from "./types";

export async function checkDatabase(db: AppDatabase) {
  await db.run(sql`select 1`);
}

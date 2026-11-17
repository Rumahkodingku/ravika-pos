import "server-only";

import { checkDatabase } from "@/infrastructure/database/health";
import type { AppDatabase } from "@/infrastructure/database/types";

export async function getHealth(db: AppDatabase) {
  await checkDatabase(db);

  return { status: "ok", database: "ok" };
}

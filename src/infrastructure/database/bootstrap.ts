import "server-only";

import { seedDatabase } from "./seed";
import type { AppDatabase } from "./types";

export async function bootstrap(db: AppDatabase) {
  const mode =
    process.env.NODE_ENV === "production" ? "production" : "development";

  await db.transaction(async (tx) => {
    await seedDatabase(tx as unknown as AppDatabase, mode);
  });
}

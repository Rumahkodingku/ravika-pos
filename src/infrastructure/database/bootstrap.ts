import "server-only";

import { seedDatabase } from "./seed";
import type { AppDatabase } from "./types";

export async function bootstrap(db: AppDatabase) {
  const mode =
    process.env.RAVIKA_SEED_MODE === "development" ||
    process.env.NODE_ENV !== "production"
      ? "development"
      : "production";

  await db.transaction(async (tx) => {
    await seedDatabase(tx as unknown as AppDatabase, mode);
  });
}

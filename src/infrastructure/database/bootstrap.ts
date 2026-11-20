import "server-only";

import { ensureDemoImages } from "./demo-data";
import { seedDatabase } from "./seed";
import type { AppDatabase } from "./types";

export async function bootstrap(db: AppDatabase) {
  const mode =
    process.env.RAVIKA_SEED_MODE === "development" ||
    process.env.NODE_ENV !== "production"
      ? "development"
      : "production";

  let businessId = "business-ravika";

  await db.transaction(async (tx) => {
    businessId = await seedDatabase(tx as unknown as AppDatabase, mode);
  });

  if (mode === "development" && process.env.RAVIKA_SEED_DEMO !== "false") {
    await ensureDemoImages(db, businessId);
  }
}

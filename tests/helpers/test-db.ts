import { createDatabase } from "@/infrastructure/database/client";
import { seedDatabase } from "@/infrastructure/database/seed";

export async function createTestDatabase() {
  const bundle = await createDatabase(":memory:", { bootstrap: false });
  await seedDatabase(bundle.db, "development");
  return bundle;
}

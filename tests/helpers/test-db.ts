import { createDatabase } from "@/infrastructure/database/client";
import { seedTestDatabase } from "./test-fixtures";

export async function createTestDatabase() {
  const bundle = await createDatabase(":memory:", { bootstrap: false });
  await seedTestDatabase(bundle);
  return bundle;
}

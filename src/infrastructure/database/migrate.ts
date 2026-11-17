import "server-only";

import { resolve } from "node:path";
import type { DatabaseSync } from "node:sqlite";
import { migrate } from "drizzle-orm/sqlite-proxy/migrator";
import type { AppDatabase } from "./types";

export async function runMigrations(db: AppDatabase, sqlite: DatabaseSync) {
  await migrate(
    db,
    async (queries) => {
      sqlite.exec("BEGIN");
      try {
        for (const query of queries) {
          sqlite.exec(query);
        }
        sqlite.exec("COMMIT");
      } catch (error) {
        sqlite.exec("ROLLBACK");
        throw error;
      }
    },
    { migrationsFolder: resolve(process.cwd(), "drizzle") },
  );
}

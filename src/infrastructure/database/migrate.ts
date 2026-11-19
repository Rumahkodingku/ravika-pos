import "server-only";

import type { DatabaseSync } from "node:sqlite";
import { migrate } from "drizzle-orm/sqlite-proxy/migrator";
import { migrationsDirectory } from "@/shared/paths";
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
    { migrationsFolder: migrationsDirectory() },
  );
}

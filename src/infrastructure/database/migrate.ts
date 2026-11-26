import "server-only";

import type { DatabaseSync } from "node:sqlite";
import { migrate } from "drizzle-orm/sqlite-proxy/migrator";
import { migrationsDirectory } from "@/shared/paths";
import type { AppDatabase } from "./types";

export async function runMigrations(db: AppDatabase, sqlite: DatabaseSync) {
  const foreignKeys = sqlite.prepare("PRAGMA foreign_keys").get() as
    | { foreign_keys: number }
    | undefined;

  sqlite.exec("PRAGMA foreign_keys = OFF;");

  try {
    await migrate(
      db,
      async (queries) => {
        sqlite.exec("BEGIN");
        try {
          for (const query of queries) {
            sqlite.exec(query);
          }

          const violations = sqlite
            .prepare("PRAGMA foreign_key_check")
            .all() as unknown[];

          if (violations.length > 0) {
            throw new Error("Migration violated foreign key constraints.");
          }

          sqlite.exec("COMMIT");
        } catch (error) {
          sqlite.exec("ROLLBACK");
          throw error;
        }
      },
      { migrationsFolder: migrationsDirectory() },
    );
  } finally {
    if (foreignKeys?.foreign_keys) {
      sqlite.exec("PRAGMA foreign_keys = ON;");
    }
  }
}

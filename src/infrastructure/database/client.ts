import "server-only";

import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import { databasePath } from "@/shared/paths";
import { bootstrap } from "./bootstrap";
import { runMigrations } from "./migrate";
import * as schema from "./schema";
import type { AppDatabase } from "./types";

export type DatabaseBundle = {
  db: AppDatabase;
  sqlite: DatabaseSync;
  close: () => void;
};

function createProxy(sqlite: DatabaseSync) {
  return async (
    query: string,
    params: SQLInputValue[],
    method: "run" | "all" | "values" | "get",
  ) => {
    const statement = sqlite.prepare(query);

    if (method === "run") {
      statement.run(...params);
      return { rows: [] };
    }

    if (method === "get") {
      const row = statement.get(...params);
      return { rows: row ? Object.values(row) : [] };
    }

    const rows = statement.all(...params);
    return { rows: rows.map((row) => Object.values(row)) };
  };
}

export async function createDatabase(
  path: string,
  options: { bootstrap?: boolean } = {},
): Promise<DatabaseBundle> {
  if (path !== ":memory:") {
    mkdirSync(dirname(resolve(path)), { recursive: true });
  }

  const sqlite = new DatabaseSync(path);
  sqlite.exec("PRAGMA journal_mode = WAL;");
  sqlite.exec("PRAGMA foreign_keys = ON;");
  sqlite.exec("PRAGMA busy_timeout = 5000;");
  sqlite.exec("PRAGMA synchronous = NORMAL;");

  const db = drizzle<typeof schema>(createProxy(sqlite), { schema });
  await runMigrations(db, sqlite);

  if (options.bootstrap !== false) {
    await bootstrap(db);
  }

  return {
    db,
    sqlite,
    close: () => sqlite.close(),
  };
}

const globalForDatabase = globalThis as unknown as {
  ravikaDatabase?: Promise<DatabaseBundle>;
};

export function getDb() {
  if (!globalForDatabase.ravikaDatabase) {
    const promise = createDatabase(databasePath());

    globalForDatabase.ravikaDatabase = promise;

    promise.catch(() => {
      if (globalForDatabase.ravikaDatabase === promise) {
        globalForDatabase.ravikaDatabase = undefined;
      }
    });
  }

  return globalForDatabase.ravikaDatabase;
}

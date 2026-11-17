import type { SqliteRemoteDatabase } from "drizzle-orm/sqlite-proxy";
import type * as schema from "./schema";

export type AppDatabase = SqliteRemoteDatabase<typeof schema>;

export type DbExecutor = Pick<
  AppDatabase,
  "select" | "insert" | "update" | "delete"
>;

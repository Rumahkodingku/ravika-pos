import "server-only";

import { dirname, resolve } from "node:path";

export function dataDirectory() {
  return resolve(process.env.RAVIKA_DATA_DIR ?? resolve(process.cwd(), "data"));
}

export function databasePath() {
  if (process.env.RAVIKA_DB_PATH === ":memory:") {
    return ":memory:";
  }

  return resolve(
    process.env.RAVIKA_DB_PATH ?? resolve(dataDirectory(), "ravika.sqlite"),
  );
}

export function backupDirectory() {
  return resolve(
    process.env.RAVIKA_BACKUP_DIR ?? resolve(dataDirectory(), "backups"),
  );
}

export function configFilePath() {
  return resolve(
    process.env.RAVIKA_CONFIG_FILE ?? resolve(process.cwd(), ".env"),
  );
}

export function migrationsDirectory() {
  return resolve(
    process.env.RAVIKA_MIGRATIONS_DIR ?? resolve(process.cwd(), "drizzle"),
  );
}

export function networkConfigPath() {
  return resolve(
    process.env.RAVIKA_CONFIG_DIR ?? dirname(configFilePath()),
    "network.json",
  );
}

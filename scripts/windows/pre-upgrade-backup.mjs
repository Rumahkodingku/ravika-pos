import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { backup, DatabaseSync } from "node:sqlite";

const programData =
  process.env.ProgramData ?? process.env.PROGRAMDATA ?? "C:\\ProgramData";
const dbPath =
  process.env.RAVIKA_DB_PATH ??
  resolve(programData, "RAVIKA POS", "data", "ravika.sqlite");

if (dbPath === ":memory:") {
  throw new Error("RAVIKA_DB_PATH harus berupa file database.");
}

const backupDir = resolve(
  process.env.RAVIKA_BACKUP_DIR ??
    resolve(programData, "RAVIKA POS", "backups"),
);
const target = resolve(backupDir, "ravika-pre-upgrade.sqlite");

mkdirSync(backupDir, { recursive: true });

const db = new DatabaseSync(dbPath);

try {
  await backup(db, target);
} finally {
  db.close();
}

console.log(target);

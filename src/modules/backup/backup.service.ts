import "server-only";

import { createHash } from "node:crypto";
import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
} from "node:fs";
import { resolve } from "node:path";
import { backup, DatabaseSync } from "node:sqlite";
import { eq } from "drizzle-orm";
import type { DatabaseBundle } from "@/infrastructure/database/client";
import { backupRecords } from "@/infrastructure/database/schema";
import type { AppDatabase } from "@/infrastructure/database/types";
import { writeAudit } from "@/modules/audit/audit.service";
import { AppError } from "@/shared/errors/app-error";
import { newId } from "@/shared/ids";
import { now } from "@/shared/time";
import type { BackupRecord } from "@/types/domain";

type BackupRow = typeof backupRecords.$inferSelect;

function toRecord(row: BackupRow): BackupRecord {
  return {
    id: row.id,
    fileName: row.fileName,
    filePath: row.filePath,
    fileSize: row.fileSize,
    checksum: row.checksum,
    status: row.status,
    createdBy: row.createdBy,
    createdAt: row.createdAt.toISOString(),
  };
}

function backupDirectory() {
  return resolve(process.cwd(), "data/backups");
}

function databasePath() {
  if (process.env.RAVIKA_DB_PATH === ":memory:") {
    return ":memory:";
  }

  return process.env.RAVIKA_DB_PATH
    ? resolve(process.env.RAVIKA_DB_PATH)
    : resolve(process.cwd(), "data/ravika.sqlite");
}

function timestampName(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");

  return `ravika-${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(
    date.getUTCDate(),
  )}-${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(
    date.getUTCSeconds(),
  )}.sqlite`;
}

export async function listBackups(db: AppDatabase) {
  const rows = await db.select().from(backupRecords);

  return rows
    .filter((row) => row.status !== "IN_PROGRESS")
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
    .map(toRecord);
}

export async function createBackup(
  bundle: DatabaseBundle,
  businessId: string,
  actorId: string,
) {
  const timestamp = now();
  const fileName = timestampName(timestamp);
  const filePath = resolve(backupDirectory(), fileName);
  const id = newId();

  mkdirSync(backupDirectory(), { recursive: true });
  await bundle.db.insert(backupRecords).values({
    id,
    fileName,
    filePath,
    fileSize: 0,
    checksum: "",
    status: "IN_PROGRESS",
    createdBy: actorId,
    createdAt: timestamp,
  });

  try {
    await backup(bundle.sqlite, filePath);
    const fileSize = statSync(filePath).size;
    const checksum = createHash("sha256")
      .update(readFileSync(filePath))
      .digest("hex");

    await bundle.db
      .update(backupRecords)
      .set({ fileSize, checksum, status: "READY" })
      .where(eq(backupRecords.id, id));

    await writeAudit(bundle.db, {
      businessId,
      actorUserId: actorId,
      action: "backup.create",
      resourceType: "backup",
      resourceId: id,
      metadata: { fileName, fileSize, checksum },
    });

    return toRecord({
      id,
      fileName,
      filePath,
      fileSize,
      checksum,
      status: "READY",
      createdBy: actorId,
      createdAt: timestamp,
    });
  } catch {
    await bundle.db
      .update(backupRecords)
      .set({ status: "FAILED" })
      .where(eq(backupRecords.id, id));

    throw AppError.unavailable();
  }
}

export async function restoreBackup(
  db: AppDatabase,
  bundle: DatabaseBundle,
  businessId: string,
  input: { backupId: string; confirm: boolean },
  actorId: string,
) {
  if (!input.confirm) {
    throw AppError.validation([
      { path: "confirm", message: "Konfirmasi restore wajib diisi." },
    ]);
  }

  const row = (
    await db
      .select()
      .from(backupRecords)
      .where(eq(backupRecords.id, input.backupId))
      .limit(1)
  )[0];

  if (!row || row.status !== "READY") {
    throw AppError.notFound(
      "BACKUP_NOT_FOUND",
      "Backup tidak ditemukan atau belum siap.",
    );
  }

  if (
    row.checksum &&
    createHash("sha256").update(readFileSync(row.filePath)).digest("hex") !==
      row.checksum
  ) {
    throw AppError.conflict(
      "BACKUP_CHECKSUM_MISMATCH",
      "Checksum backup tidak cocok.",
    );
  }

  let probe: DatabaseSync | null = null;

  try {
    probe = new DatabaseSync(row.filePath, { readOnly: true });
    const result = probe.prepare("PRAGMA integrity_check").all();
    const valid = result.every((entry) => Object.values(entry)[0] === "ok");

    if (!valid) {
      throw AppError.conflict(
        "BACKUP_INTEGRITY_FAILED",
        "Integritas backup tidak valid.",
      );
    }
  } finally {
    probe?.close();
  }

  if (databasePath() === ":memory:") {
    throw AppError.unprocessable(
      "RESTORE_UNAVAILABLE",
      "Restore tidak tersedia untuk database in-memory.",
    );
  }

  await writeAudit(db, {
    businessId,
    actorUserId: actorId,
    action: "backup.restore",
    resourceType: "backup",
    resourceId: row.id,
    metadata: { fileName: row.fileName },
  });

  const destination = databasePath();

  bundle.close();
  copyFileSync(row.filePath, destination);
  rmSync(`${destination}-wal`, { force: true });
  rmSync(`${destination}-shm`, { force: true });

  return { restored: true, restartRequired: true };
}

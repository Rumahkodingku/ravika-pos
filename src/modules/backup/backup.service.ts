import "server-only";

import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
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
import { logger } from "@/shared/logging/logger";
import { backupDirectory, databasePath } from "@/shared/paths";
import { now } from "@/shared/time";
import type { BackupRecord } from "@/types/domain";

type BackupRow = typeof backupRecords.$inferSelect;

const MAX_BACKUP_SIZE = 250 * 1024 * 1024;
const SQLITE_HEADER = "SQLite format 3\u0000";
const REQUIRED_TABLES = [
  "business",
  "users",
  "roles",
  "permissions",
  "orders",
  "payments",
  "backup_records",
];

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

function retentionCount() {
  const value = Number.parseInt(process.env.RAVIKA_BACKUP_RETENTION ?? "7", 10);

  return Number.isFinite(value) && value > 0 ? value : 7;
}

function timestampName(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");

  return `ravika-${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(
    date.getUTCDate(),
  )}-${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(
    date.getUTCSeconds(),
  )}.sqlite`;
}

function uniqueBackupPath(date: Date, id: string) {
  const fileName = timestampName(date);
  const filePath = resolve(backupDirectory(), fileName);

  if (!existsSync(filePath)) {
    return { fileName, filePath };
  }

  const suffixed = fileName.replace(".sqlite", `-${id.slice(0, 8)}.sqlite`);

  return {
    fileName: suffixed,
    filePath: resolve(backupDirectory(), suffixed),
  };
}

function checksum(filePath: string) {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

function validateBackupFile(
  filePath: string,
  invalid: (code: string, detail: string) => AppError,
) {
  let probe: DatabaseSync | null = null;

  try {
    probe = new DatabaseSync(filePath, { readOnly: true });
    const result = probe.prepare("PRAGMA integrity_check").all();
    const valid = result.every((entry) => Object.values(entry)[0] === "ok");

    if (!valid) {
      throw invalid(
        "BACKUP_INTEGRITY_FAILED",
        "Integritas backup tidak valid.",
      );
    }

    const tables = probe
      .prepare("select name from sqlite_master where type = 'table'")
      .all();
    const names = new Set(tables.map((row) => String(Object.values(row)[0])));
    const missing = REQUIRED_TABLES.filter((table) => !names.has(table));

    if (missing.length > 0) {
      throw invalid(
        "BACKUP_SCHEMA_INVALID",
        "Backup tidak kompatibel dengan versi aplikasi ini.",
      );
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw invalid("BACKUP_INVALID", "File backup tidak valid.");
  } finally {
    probe?.close();
  }
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
  const id = newId();
  const { fileName, filePath } = uniqueBackupPath(timestamp, id);

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
    const digest = checksum(filePath);

    await bundle.db
      .update(backupRecords)
      .set({ fileSize, checksum: digest, status: "READY" })
      .where(eq(backupRecords.id, id));

    await writeAudit(bundle.db, {
      businessId,
      actorUserId: actorId,
      action: "backup.create",
      resourceType: "backup",
      resourceId: id,
      metadata: { fileName, fileSize, checksum: digest },
    });

    try {
      await cleanupBackups(bundle.db, businessId, actorId);
    } catch (error) {
      logger.error("Backup cleanup failed", {
        error: error instanceof Error ? error.message : String(error),
      });
    }

    return toRecord({
      id,
      fileName,
      filePath,
      fileSize,
      checksum: digest,
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

export async function getBackupFile(
  db: AppDatabase,
  businessId: string,
  backupId: string,
  actorId: string,
) {
  const row = (
    await db
      .select()
      .from(backupRecords)
      .where(eq(backupRecords.id, backupId))
      .limit(1)
  )[0];

  if (!row || row.status !== "READY") {
    throw AppError.notFound(
      "BACKUP_NOT_FOUND",
      "Backup tidak ditemukan atau belum siap.",
    );
  }

  if (checksum(row.filePath) !== row.checksum) {
    throw AppError.conflict(
      "BACKUP_CHECKSUM_MISMATCH",
      "Checksum backup tidak cocok.",
    );
  }

  await writeAudit(db, {
    businessId,
    actorUserId: actorId,
    action: "backup.download",
    resourceType: "backup",
    resourceId: row.id,
    metadata: { fileName: row.fileName, fileSize: row.fileSize },
  });

  return {
    fileName: row.fileName,
    filePath: row.filePath,
    fileSize: row.fileSize,
  };
}

export async function uploadBackup(
  db: AppDatabase,
  businessId: string,
  actorId: string,
  file: File,
) {
  if (!file.name.toLowerCase().endsWith(".sqlite")) {
    throw AppError.validation([
      { path: "file", message: "File harus berekstensi .sqlite." },
    ]);
  }

  if (file.size > MAX_BACKUP_SIZE) {
    throw AppError.tooLarge("Ukuran backup maksimal 250 MB.");
  }

  // shortcut: upload buffers up to 250 MB in memory; stream to disk if backups grow.
  const buffer = Buffer.from(await file.arrayBuffer());

  if (!buffer.subarray(0, 16).equals(Buffer.from(SQLITE_HEADER))) {
    throw AppError.validation([
      { path: "file", message: "File backup tidak valid." },
    ]);
  }

  const timestamp = now();
  const id = newId();
  const tempPath = resolve(backupDirectory(), `.upload-${id}.sqlite`);
  let finalPath: string | null = null;

  mkdirSync(backupDirectory(), { recursive: true });
  writeFileSync(tempPath, buffer);

  try {
    validateBackupFile(tempPath, (_code, detail) =>
      AppError.validation([{ path: "file", message: detail }]),
    );

    const target = uniqueBackupPath(timestamp, id);
    finalPath = target.filePath;
    renameSync(tempPath, finalPath);

    const digest = checksum(finalPath);
    const fileSize = statSync(finalPath).size;

    await db.insert(backupRecords).values({
      id,
      fileName: target.fileName,
      filePath: finalPath,
      fileSize,
      checksum: digest,
      status: "READY",
      createdBy: actorId,
      createdAt: timestamp,
    });

    await writeAudit(db, {
      businessId,
      actorUserId: actorId,
      action: "backup.upload",
      resourceType: "backup",
      resourceId: id,
      metadata: { fileName: target.fileName, fileSize, checksum: digest },
    });

    try {
      await cleanupBackups(db, businessId, actorId);
    } catch (error) {
      logger.error("Backup cleanup failed", {
        error: error instanceof Error ? error.message : String(error),
      });
    }

    return toRecord({
      id,
      fileName: target.fileName,
      filePath: finalPath,
      fileSize,
      checksum: digest,
      status: "READY",
      createdBy: actorId,
      createdAt: timestamp,
    });
  } catch (error) {
    rmSync(tempPath, { force: true });
    if (finalPath) {
      rmSync(finalPath, { force: true });
    }
    throw error;
  }
}

export async function cleanupBackups(
  db: AppDatabase,
  businessId: string,
  actorId: string,
  limit = retentionCount(),
) {
  const rows = await db
    .select()
    .from(backupRecords)
    .where(eq(backupRecords.status, "READY"));
  const sorted = rows.sort(
    (left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
  );
  const expired = sorted.slice(limit);

  if (expired.length === 0) {
    return;
  }

  for (const row of expired) {
    rmSync(row.filePath, { force: true });
    await db.delete(backupRecords).where(eq(backupRecords.id, row.id));
  }

  await writeAudit(db, {
    businessId,
    actorUserId: actorId,
    action: "backup.cleanup",
    resourceType: "backup",
    resourceId: "retention",
    metadata: { deleted: expired.length, limit },
  });
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

  if (checksum(row.filePath) !== row.checksum) {
    throw AppError.conflict(
      "BACKUP_CHECKSUM_MISMATCH",
      "Checksum backup tidak cocok.",
    );
  }

  validateBackupFile(row.filePath, AppError.conflict);

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

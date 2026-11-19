import { readFileSync, rmSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { DatabaseBundle } from "@/infrastructure/database/client";
import {
  cleanupBackups,
  createBackup,
  getBackupFile,
  listBackups,
  uploadBackup,
} from "@/modules/backup/backup.service";
import { createTestDatabase } from "../helpers/test-db";

let bundle: DatabaseBundle;
const businessId = "business-ravika";
const actorId = "user-owner";

beforeEach(async () => {
  bundle = await createTestDatabase();
});

afterEach(() => {
  bundle.close();
});

describe("backup module", () => {
  it("downloads a ready backup after checksum verification", async () => {
    const backup = await createBackup(bundle, businessId, actorId);
    const file = await getBackupFile(bundle.db, businessId, backup.id, actorId);

    expect(file.fileName).toBe(backup.fileName);
    expect(readFileSync(file.filePath).length).toBe(backup.fileSize);
    rmSync(file.filePath, { force: true });
  });

  it("uploads a valid SQLite backup", async () => {
    const source = await createBackup(bundle, businessId, actorId);
    const file = new File(
      [readFileSync(source.filePath)],
      "uploaded-backup.sqlite",
      { type: "application/octet-stream" },
    );
    const uploaded = await uploadBackup(bundle.db, businessId, actorId, file);

    expect(uploaded.status).toBe("READY");
    expect(uploaded.fileName).toMatch(/^ravika-.*\.sqlite$/);
    expect(
      (await listBackups(bundle.db)).some((row) => row.id === uploaded.id),
    ).toBe(true);

    rmSync(source.filePath, { force: true });
    rmSync(uploaded.filePath, { force: true });
  });

  it("rejects a file that is not SQLite", async () => {
    const file = new File(["not a database"], "bad.sqlite", {
      type: "application/octet-stream",
    });

    await expect(
      uploadBackup(bundle.db, businessId, actorId, file),
    ).rejects.toMatchObject({ code: "VALIDATION_FAILED" });
  });

  it("keeps only the newest backups", async () => {
    const first = await createBackup(bundle, businessId, actorId);
    const second = await createBackup(bundle, businessId, actorId);

    await cleanupBackups(bundle.db, businessId, actorId, 1);

    const remaining = await listBackups(bundle.db);

    expect(remaining).toHaveLength(1);
    expect(remaining[0]?.id).toBe(second.id);

    rmSync(first.filePath, { force: true });
    rmSync(second.filePath, { force: true });
  });
});

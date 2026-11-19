import "server-only";

import { and, eq } from "drizzle-orm";
import { getDb } from "@/infrastructure/database/client";
import { users } from "@/infrastructure/database/schema";
import { findFirstBusiness } from "@/modules/business/business.repository";
import { findRoleByCode } from "@/modules/users/user.repository";
import { logger } from "@/shared/logging/logger";
import { createBackup } from "./backup.service";

let started = false;

function nextDelay() {
  const [hour, minute] = (process.env.RAVIKA_BACKUP_TIME ?? "02:00")
    .split(":")
    .map((value) => Number.parseInt(value, 10));
  const next = new Date();

  next.setHours(
    Number.isFinite(hour) ? hour : 2,
    Number.isFinite(minute) ? minute : 0,
    0,
    0,
  );

  if (next.getTime() <= Date.now()) {
    next.setDate(next.getDate() + 1);
  }

  return next.getTime() - Date.now();
}

async function runScheduledBackup() {
  const bundle = await getDb();
  const business = await findFirstBusiness(bundle.db);

  if (!business) {
    return;
  }

  const ownerRole = await findRoleByCode(bundle.db, business.id, "OWNER");

  if (!ownerRole) {
    return;
  }

  const owner = (
    await bundle.db
      .select({ id: users.id })
      .from(users)
      .where(
        and(
          eq(users.businessId, business.id),
          eq(users.roleId, ownerRole.id),
          eq(users.isActive, true),
        ),
      )
      .limit(1)
  )[0];

  if (!owner) {
    return;
  }

  await createBackup(bundle, business.id, owner.id);
}

function scheduleNext() {
  const timer = setTimeout(async () => {
    try {
      await runScheduledBackup();
    } catch (error) {
      logger.error("Scheduled backup failed", {
        error: error instanceof Error ? error.message : String(error),
      });
    }

    scheduleNext();
  }, nextDelay());

  timer.unref();
}

export function startBackupScheduler() {
  if (started || process.env.RAVIKA_BACKUP_SCHEDULE !== "daily") {
    return;
  }

  started = true;
  scheduleNext();
}

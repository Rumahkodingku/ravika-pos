import "server-only";

import { randomBytes } from "node:crypto";
import type { AppDatabase } from "@/infrastructure/database/types";
import { hashPassword } from "@/modules/auth/password";
import { findFirstBusiness } from "@/modules/business/business.repository";
import { updateBusiness } from "@/modules/business/business.service";
import {
  countActiveOwners,
  findRoleByCode,
  insertUser,
} from "@/modules/users/user.repository";
import { upsertEnvValue } from "@/shared/env-file";
import { AppError } from "@/shared/errors/app-error";
import { newId } from "@/shared/ids";
import { now } from "@/shared/time";
import type { SetupInput } from "./setup.schemas";

function defaultUsername(email: string) {
  return (
    email
      .split("@")[0]
      ?.toLowerCase()
      .replace(/[^a-z0-9._-]/g, "")
      .slice(0, 40) || "owner"
  );
}

export async function getSetupStatus(db: AppDatabase) {
  const business = await findFirstBusiness(db);

  if (!business) {
    throw AppError.unavailable();
  }

  const ownerRole = await findRoleByCode(db, business.id, "OWNER");

  if (!ownerRole) {
    throw AppError.internal();
  }

  return { setupRequired: (await countActiveOwners(db, business.id)) === 0 };
}

export async function runSetup(
  db: AppDatabase,
  envPath: string,
  input: SetupInput,
) {
  const business = await findFirstBusiness(db);

  if (!business) {
    throw AppError.unavailable();
  }

  const ownerRole = await findRoleByCode(db, business.id, "OWNER");

  if (!ownerRole) {
    throw AppError.internal();
  }

  if ((await countActiveOwners(db, business.id)) > 0) {
    throw AppError.conflict("SETUP_ALREADY_DONE", "Instalasi sudah selesai.");
  }

  const qrTokenKey = randomBytes(32).toString("base64");
  upsertEnvValue(envPath, "RAVIKA_QR_TOKEN_KEY", qrTokenKey);

  const timestamp = now();
  const email = input.ownerEmail.toLowerCase();
  const username = (
    input.ownerUsername || defaultUsername(email)
  ).toLowerCase();

  await db.transaction(async (tx) => {
    await updateBusiness(tx as unknown as AppDatabase, business.id, {
      address: input.address,
      code: input.businessCode.toUpperCase(),
      name: input.businessName,
      phone: input.phone,
    });

    await insertUser(tx as unknown as AppDatabase, {
      businessId: business.id,
      createdAt: timestamp,
      email,
      id: newId(),
      isActive: true,
      name: input.ownerName,
      passwordHash: await hashPassword(input.ownerPassword),
      roleId: ownerRole.id,
      updatedAt: timestamp,
      username,
    });

  });

  return { restartRequired: true, setupComplete: true as const };
}

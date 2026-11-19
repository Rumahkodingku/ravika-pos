import "server-only";

import { and, eq } from "drizzle-orm";
import { hashPassword } from "@/modules/auth/password";
import { permissionGroups, roleDefinitions } from "@/shared/permissions";
import { business, permissions, rolePermissions, roles, users } from "./schema";
import type { AppDatabase } from "./types";

type SeedMode = "development" | "production";

function envOrDefault(key: string, fallback: string) {
  return process.env[key]?.trim() || fallback;
}

async function ensureBusiness(db: AppDatabase, now: Date) {
  const existing = await db.select().from(business).limit(1);

  if (existing[0]) {
    return existing[0];
  }

  const row = {
    id: "business-ravika",
    name: envOrDefault("RAVIKA_BUSINESS_NAME", "RAVIKA"),
    code: envOrDefault("RAVIKA_BUSINESS_CODE", "RVK"),
    address: envOrDefault("RAVIKA_BUSINESS_ADDRESS", "Jakarta Selatan"),
    phone: envOrDefault("RAVIKA_BUSINESS_PHONE", "021-000000"),
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(business).values(row);
  return row;
}

async function ensurePermissions(db: AppDatabase, now: Date) {
  for (const group of permissionGroups) {
    for (const permission of group.permissions) {
      await db
        .insert(permissions)
        .values({
          id: `permission-${permission.code}`,
          code: permission.code,
          label: permission.label,
          groupName: group.label,
          createdAt: now,
        })
        .onConflictDoUpdate({
          target: permissions.code,
          set: { label: permission.label, groupName: group.label },
        });
    }
  }

  const rows = await db.select().from(permissions);
  return new Map(rows.map((row) => [row.code, row.id]));
}

async function ensureRoles(
  db: AppDatabase,
  businessId: string,
  permissionIdByCode: Map<string, string>,
  now: Date,
) {
  const roleIdByCode = new Map<string, string>();

  for (const definition of roleDefinitions) {
    const existing = await db
      .select()
      .from(roles)
      .where(
        and(eq(roles.businessId, businessId), eq(roles.code, definition.code)),
      )
      .limit(1);

    let roleId = existing[0]?.id;

    if (!roleId) {
      roleId = `role-${definition.code.toLowerCase()}`;
      await db.insert(roles).values({
        id: roleId,
        businessId,
        name: definition.name,
        code: definition.code,
        description: definition.description,
        isSystem: true,
        createdAt: now,
        updatedAt: now,
      });
    }

    roleIdByCode.set(definition.code, roleId);

    const shouldSyncPermissions = !existing[0] || definition.code === "OWNER";

    if (shouldSyncPermissions) {
      for (const code of definition.permissionCodes) {
        const permissionId = permissionIdByCode.get(code);

        if (!permissionId) {
          continue;
        }

        await db
          .insert(rolePermissions)
          .values({ roleId, permissionId })
          .onConflictDoNothing();
      }
    }
  }

  return roleIdByCode;
}

async function ensureUser(
  db: AppDatabase,
  input: {
    id: string;
    businessId: string;
    roleId: string;
    name: string;
    email: string;
    username: string;
    password: string;
    now: Date;
  },
) {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email.toLowerCase()))
    .limit(1);

  if (existing[0]) {
    return;
  }

  await db.insert(users).values({
    id: input.id,
    businessId: input.businessId,
    roleId: input.roleId,
    name: input.name,
    email: input.email.toLowerCase(),
    username: input.username.toLowerCase(),
    passwordHash: await hashPassword(input.password),
    isActive: true,
    createdAt: input.now,
    updatedAt: input.now,
  });
}

async function activeOwnerCount(db: AppDatabase, ownerRoleId: string) {
  const rows = await db
    .select()
    .from(users)
    .where(and(eq(users.roleId, ownerRoleId), eq(users.isActive, true)));

  return rows.length;
}

export async function seedDatabase(db: AppDatabase, mode: SeedMode) {
  const productionEmail = process.env.RAVIKA_BOOTSTRAP_OWNER_EMAIL?.trim();
  const productionPassword = process.env.RAVIKA_BOOTSTRAP_OWNER_PASSWORD;

  if (mode === "production" && productionEmail && productionPassword) {
    // Env bootstrap remains a fallback. The first-run wizard can create the owner when these are absent.
  }

  const now = new Date();
  const businessRow = await ensureBusiness(db, now);
  const permissionIdByCode = await ensurePermissions(db, now);
  const roleIdByCode = await ensureRoles(
    db,
    businessRow.id,
    permissionIdByCode,
    now,
  );
  const ownerRoleId = roleIdByCode.get("OWNER");

  if (!ownerRoleId) {
    throw new Error("Role OWNER gagal dibuat.");
  }

  const ownerCount = await activeOwnerCount(db, ownerRoleId);

  if (
    ownerCount === 0 &&
    mode === "production" &&
    productionEmail &&
    productionPassword
  ) {
    await ensureUser(db, {
      id: "user-owner",
      businessId: businessRow.id,
      roleId: ownerRoleId,
      name: envOrDefault("RAVIKA_BOOTSTRAP_OWNER_NAME", "Pemilik"),
      email: productionEmail,
      username: "owner",
      password: productionPassword,
      now,
    });
  }
}

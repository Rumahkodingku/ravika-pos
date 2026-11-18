import "server-only";

import { and, eq, inArray } from "drizzle-orm";
import {
  permissions,
  rolePermissions,
  roles,
} from "@/infrastructure/database/schema";
import type { DbExecutor } from "@/infrastructure/database/types";

export async function listRoleRows(db: DbExecutor, businessId: string) {
  return db.select().from(roles).where(eq(roles.businessId, businessId));
}

export async function findRole(db: DbExecutor, businessId: string, id: string) {
  const rows = await db
    .select()
    .from(roles)
    .where(and(eq(roles.id, id), eq(roles.businessId, businessId)))
    .limit(1);

  return rows[0] ?? null;
}

export async function findRoleByCode(
  db: DbExecutor,
  businessId: string,
  code: string,
) {
  const rows = await db
    .select()
    .from(roles)
    .where(and(eq(roles.businessId, businessId), eq(roles.code, code)))
    .limit(1);

  return rows[0] ?? null;
}

export async function listRolePermissionCodes(db: DbExecutor, roleId: string) {
  const links = await db
    .select({ permissionId: rolePermissions.permissionId })
    .from(rolePermissions)
    .where(eq(rolePermissions.roleId, roleId));

  if (links.length === 0) {
    return [];
  }

  const rows = await db
    .select({ code: permissions.code })
    .from(permissions)
    .where(
      inArray(
        permissions.id,
        links.map((link) => link.permissionId),
      ),
    );

  return rows.map((row) => row.code);
}

export async function listPermissionRows(db: DbExecutor) {
  return db.select().from(permissions);
}

export async function createRoleRow(
  db: DbExecutor,
  input: {
    id: string;
    businessId: string;
    name: string;
    code: string;
    description: string;
    isSystem: boolean;
    createdAt: Date;
    updatedAt: Date;
  },
) {
  await db.insert(roles).values(input);
}

export async function updateRoleRow(
  db: DbExecutor,
  id: string,
  input: {
    name: string;
    code: string;
    description: string;
    updatedAt: Date;
  },
) {
  await db.update(roles).set(input).where(eq(roles.id, id));
}

export async function replaceRolePermissions(
  db: DbExecutor,
  roleId: string,
  permissionIds: string[],
) {
  await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));

  if (permissionIds.length > 0) {
    await db
      .insert(rolePermissions)
      .values(permissionIds.map((permissionId) => ({ roleId, permissionId })));
  }
}

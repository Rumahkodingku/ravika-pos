import "server-only";

import type { AppDatabase } from "@/infrastructure/database/types";
import { AppError } from "@/shared/errors/app-error";
import { newId } from "@/shared/ids";
import { permissionGroups } from "@/shared/permissions";
import { now } from "@/shared/time";
import type { Role } from "@/types/domain";
import {
  createRoleRow,
  findRole,
  findRoleByCode,
  listPermissionRows,
  listRolePermissionCodes,
  listRoleRows,
  replaceRolePermissions,
  updateRoleRow,
} from "./role.repository";
import type { RoleCreateInput, RoleUpdateInput } from "./role.schemas";

async function toRole(
  db: AppDatabase,
  row: Awaited<ReturnType<typeof listRoleRows>>[number],
): Promise<Role> {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    description: row.description,
    isSystem: row.isSystem,
    permissionCodes: await listRolePermissionCodes(db, row.id),
  };
}

export async function listRoles(db: AppDatabase, businessId: string) {
  const rows = await listRoleRows(db, businessId);

  return Promise.all(rows.map((row) => toRole(db, row)));
}

export async function getRole(db: AppDatabase, businessId: string, id: string) {
  const row = await findRole(db, businessId, id);

  if (!row) {
    throw AppError.notFound("ROLE_NOT_FOUND", "Role tidak ditemukan.");
  }

  return toRole(db, row);
}

function validCodes(codes: string[]) {
  const known = new Set(
    permissionGroups.flatMap((group) =>
      group.permissions.map((permission) => permission.code),
    ),
  );
  const unknown = codes.filter((code) => !known.has(code));

  if (unknown.length > 0) {
    throw AppError.validation(
      unknown.map((code) => ({
        path: "permissionCodes",
        message: `Permission ${code} tidak ditemukan.`,
      })),
    );
  }

  return codes;
}

export async function createRole(
  db: AppDatabase,
  businessId: string,
  input: RoleCreateInput,
) {
  const code = input.code.toUpperCase();
  const existing = await findRoleByCode(db, businessId, code);

  if (existing) {
    throw AppError.conflict("ROLE_CODE_IMMUTABLE", "Kode role sudah dipakai.");
  }

  const timestamp = now();
  const id = newId();
  const permissionCodes = validCodes(input.permissionCodes);
  const permissionRows = await listPermissionRows(db);
  const permissionIdByCode = new Map(
    permissionRows.map((row) => [row.code, row.id]),
  );

  await db.transaction(async (tx) => {
    await createRoleRow(tx, {
      id,
      businessId,
      name: input.name,
      code,
      description: input.description,
      isSystem: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    await replaceRolePermissions(
      tx,
      id,
      permissionCodes
        .map((permissionCode) => permissionIdByCode.get(permissionCode))
        .filter((value): value is string => Boolean(value)),
    );
  });

  return getRole(db, businessId, id);
}

export async function updateRole(
  db: AppDatabase,
  businessId: string,
  id: string,
  input: RoleUpdateInput,
) {
  const existing = await findRole(db, businessId, id);

  if (!existing) {
    throw AppError.notFound("ROLE_NOT_FOUND", "Role tidak ditemukan.");
  }

  const nextCode = input.code ? input.code.toUpperCase() : existing.code;

  if (existing.isSystem && nextCode !== existing.code) {
    throw AppError.conflict(
      "ROLE_CODE_IMMUTABLE",
      "Kode role sistem tidak dapat diubah.",
    );
  }

  if (nextCode !== existing.code) {
    const duplicate = await findRoleByCode(db, businessId, nextCode);

    if (duplicate) {
      throw AppError.conflict(
        "ROLE_CODE_IMMUTABLE",
        "Kode role sudah dipakai.",
      );
    }
  }

  await updateRoleRow(db, id, {
    name: input.name,
    code: nextCode,
    description: input.description,
    updatedAt: now(),
  });

  return getRole(db, businessId, id);
}

export async function setRolePermissions(
  db: AppDatabase,
  businessId: string,
  id: string,
  permissionCodes: string[],
) {
  const role = await findRole(db, businessId, id);

  if (!role) {
    throw AppError.notFound("ROLE_NOT_FOUND", "Role tidak ditemukan.");
  }

  const permissionRows = await listPermissionRows(db);
  const permissionIdByCode = new Map(
    permissionRows.map((row) => [row.code, row.id]),
  );
  const ids = validCodes(permissionCodes)
    .map((code) => permissionIdByCode.get(code))
    .filter((value): value is string => Boolean(value));

  await db.transaction(async (tx) => {
    await replaceRolePermissions(tx, id, ids);
  });

  return getRole(db, businessId, id);
}

export function listPermissions() {
  return permissionGroups.flatMap((group) =>
    group.permissions.map((permission) => ({
      code: permission.code,
      label: permission.label,
      group: group.label,
    })),
  );
}

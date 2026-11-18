import "server-only";

import type { AppDatabase } from "@/infrastructure/database/types";
import { hashPassword } from "@/modules/auth/password";
import { AppError } from "@/shared/errors/app-error";
import { newId } from "@/shared/ids";
import { pageOf, textMatch } from "@/shared/pagination";
import { now } from "@/shared/time";
import type { ManagementUser } from "@/types/domain";
import {
  countActiveOwners,
  findRoleByCode,
  findRoleById,
  findUserByEmail,
  findUserById,
  findUserByUsername,
  insertUser,
  listUserRows,
  updateUser,
} from "./user.repository";
import type { UserCreateInput, UserUpdateInput } from "./user.schemas";

function defaultUsername(email: string) {
  return (
    email
      .split("@")[0]
      ?.toLowerCase()
      .replace(/[^a-z0-9._-]/g, "")
      .slice(0, 40) || "user"
  );
}

function toManagementUser(
  row: Awaited<ReturnType<typeof listUserRows>>[number],
  roleCode: string,
): ManagementUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    username: row.username,
    role: roleCode as ManagementUser["role"],
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listUsers(
  db: AppDatabase,
  businessId: string,
  params: {
    search?: string;
    role?: string;
    active?: string;
    page?: number;
    pageSize?: number;
  },
) {
  const rows = await listUserRows(db, businessId);
  const filtered = (
    await Promise.all(
      rows.map(async (row) => {
        const role = await findRoleById(db, row.roleId);

        if (!role) {
          return null;
        }

        const matches =
          (textMatch(row.name, params.search) ||
            textMatch(row.email, params.search) ||
            textMatch(row.username, params.search)) &&
          (!params.role ||
            params.role === "all" ||
            role.code === params.role) &&
          (!params.active ||
            params.active === "all" ||
            String(row.isActive) === params.active);

        return matches ? toManagementUser(row, role.code) : null;
      }),
    )
  ).filter((row): row is ManagementUser => row !== null);

  return pageOf(filtered, params.page, params.pageSize);
}

export async function getUser(db: AppDatabase, businessId: string, id: string) {
  const row = await findUserById(db, id);

  if (!row || row.user.businessId !== businessId) {
    throw AppError.notFound("USER_NOT_FOUND", "Pengguna tidak ditemukan.");
  }

  return toManagementUser(row.user, row.role.code);
}

export async function createUser(
  db: AppDatabase,
  businessId: string,
  input: UserCreateInput,
) {
  const role = await findRoleByCode(db, businessId, input.role);

  if (!role) {
    throw AppError.notFound("ROLE_NOT_FOUND", "Role tidak ditemukan.");
  }

  const email = input.email.toLowerCase();
  const username = (input.username || defaultUsername(email)).toLowerCase();

  if (await findUserByEmail(db, email)) {
    throw AppError.conflict("USER_EMAIL_CONFLICT", "Email sudah dipakai.");
  }
  if (await findUserByUsername(db, username)) {
    throw AppError.conflict("USER_EMAIL_CONFLICT", "Username sudah dipakai.");
  }

  const timestamp = now();
  const id = newId();

  await insertUser(db, {
    id,
    businessId,
    roleId: role.id,
    name: input.name,
    email,
    username,
    passwordHash: await hashPassword(input.password),
    isActive: input.isActive,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  return getUser(db, businessId, id);
}

export async function updateUserById(
  db: AppDatabase,
  businessId: string,
  id: string,
  input: UserUpdateInput,
) {
  const existing = await findUserById(db, id);

  if (!existing || existing.user.businessId !== businessId) {
    throw AppError.notFound("USER_NOT_FOUND", "Pengguna tidak ditemukan.");
  }

  const role = await findRoleByCode(db, businessId, input.role);

  if (!role) {
    throw AppError.notFound("ROLE_NOT_FOUND", "Role tidak ditemukan.");
  }

  const email = input.email.toLowerCase();
  const username = (input.username || defaultUsername(email)).toLowerCase();

  if (await findUserByEmail(db, email, id)) {
    throw AppError.conflict("USER_EMAIL_CONFLICT", "Email sudah dipakai.");
  }
  if (await findUserByUsername(db, username, id)) {
    throw AppError.conflict("USER_EMAIL_CONFLICT", "Username sudah dipakai.");
  }

  const losesOwner =
    existing.role.code === "OWNER" &&
    (role.code !== "OWNER" || !input.isActive);

  if (losesOwner) {
    const otherOwners = await countActiveOwners(db, businessId, id);

    if (otherOwners === 0) {
      throw AppError.conflict(
        "LAST_OWNER_GUARD",
        "Minimal satu owner aktif harus tersedia.",
      );
    }
  }

  await updateUser(db, id, {
    roleId: role.id,
    name: input.name,
    email,
    username,
    isActive: input.isActive,
    updatedAt: now(),
  });

  return getUser(db, businessId, id);
}

import "server-only";

import type { AppDatabase, DbExecutor } from "@/infrastructure/database/types";
import { writeAudit } from "@/modules/audit/audit.service";
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
  revokeUserSessions,
  updatePassword,
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
  role: { code: string; name: string },
): ManagementUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    username: row.username,
    role: role.code,
    roleLabel: role.name,
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

        return matches ? toManagementUser(row, role) : null;
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

  return toManagementUser(row.user, row.role);
}

export async function createUser(
  db: AppDatabase,
  businessId: string,
  input: UserCreateInput,
) {
  const allowedCreateRoles = new Set(["CASHIER", "KITCHEN"]);

  if (!allowedCreateRoles.has(input.role)) {
    throw AppError.validation([
      { path: "role", message: "Role tidak tersedia untuk pengguna baru." },
    ]);
  }

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

  if (existing.role.code === "OWNER" && role.code !== "OWNER") {
    throw AppError.conflict(
      "USER_OWNER_ROLE",
      "Role owner tidak dapat diubah.",
    );
  }

  if (
    existing.role.code !== "OWNER" &&
    !["CASHIER", "KITCHEN"].includes(role.code)
  ) {
    throw AppError.validation([
      { path: "role", message: "Role tidak tersedia untuk pengguna ini." },
    ]);
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

  if (!input.isActive) {
    await revokeUserSessions(db, id);
  }

  return getUser(db, businessId, id);
}

export async function deactivateUser(
  db: AppDatabase,
  businessId: string,
  id: string,
  actorId: string,
) {
  const existing = await findUserById(db, id);

  if (!existing || existing.user.businessId !== businessId) {
    throw AppError.notFound("USER_NOT_FOUND", "Pengguna tidak ditemukan.");
  }

  if (existing.role.code === "OWNER") {
    throw AppError.conflict(
      "USER_OWNER_GUARD",
      "Owner tidak dapat dinonaktifkan.",
    );
  }

  if (existing.user.id === actorId) {
    throw AppError.conflict(
      "USER_SELF_DEACTIVATE",
      "Anda tidak dapat menonaktifkan akun sendiri.",
    );
  }

  if (!existing.user.isActive) {
    return;
  }

  await updateUser(db, id, {
    email: existing.user.email,
    isActive: false,
    name: existing.user.name,
    roleId: existing.user.roleId,
    updatedAt: now(),
    username: existing.user.username,
  });
  await revokeUserSessions(db, id);

  await writeAudit(db, {
    action: "user.deactivate",
    actorUserId: actorId,
    businessId,
    metadata: { userId: id },
    resourceId: id,
    resourceType: "user",
  });
}

export async function resetUserPassword(
  db: AppDatabase,
  businessId: string,
  id: string,
  password: string,
  actorId: string,
) {
  const existing = await findUserById(db, id);

  if (!existing || existing.user.businessId !== businessId) {
    throw AppError.notFound("USER_NOT_FOUND", "Pengguna tidak ditemukan.");
  }

  if (existing.role.code === "OWNER") {
    throw AppError.conflict(
      "USER_OWNER_PASSWORD",
      "Password owner diubah lewat profil akun.",
    );
  }

  if (password.length < 8) {
    throw AppError.validation([
      { message: "Kata sandi minimal 8 karakter.", path: "password" },
    ]);
  }

  const passwordHash = await hashPassword(password);

  await db.transaction(async (tx) => {
    await updatePassword(tx as unknown as DbExecutor, id, passwordHash);
    await revokeUserSessions(tx as unknown as DbExecutor, id);
    await writeAudit(tx as unknown as DbExecutor, {
      action: "user.reset_password",
      actorUserId: actorId,
      businessId,
      metadata: { userId: id },
      resourceId: id,
      resourceType: "user",
    });
  });
}

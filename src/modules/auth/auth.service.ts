import "server-only";

import type { AppDatabase } from "@/infrastructure/database/types";
import { listPermissionCodesForRole } from "@/modules/rbac/permission.repository";
import {
  findUserById,
  findUserByIdentity,
  updatePassword,
} from "@/modules/users/user.repository";
import { AppError } from "@/shared/errors/app-error";
import { hashToken, newId, newToken } from "@/shared/ids";
import { now } from "@/shared/time";
import type { SessionUser, UserRole } from "@/types/auth";
import { hashPassword, verifyPassword } from "./password";
import {
  allowLoginAttempt,
  clearLoginFailures,
  recordLoginFailure,
} from "./rate-limit";
import {
  createSession,
  findSessionByTokenHash,
  revokeOtherSessions,
  revokeSessionByTokenHash,
} from "./session.repository";

const DEFAULT_TTL_MS = 8 * 60 * 60 * 1000;
const REMEMBER_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type AuthContext = {
  sessionId: string;
  userId: string;
  businessId: string;
  roleId: string;
  roleCode: string;
  roleLabel: string;
  name: string;
  email: string;
  username: string;
  permissions: string[];
};

export type SessionResolution =
  | { status: "valid"; context: AuthContext }
  | { status: "missing" | "expired" | "revoked" | "invalid" };

export function toSessionUser(context: AuthContext): SessionUser {
  return {
    id: context.userId,
    name: context.name,
    email: context.email,
    username: context.username,
    role: context.roleCode as UserRole,
    roleLabel: context.roleLabel,
    permissions: context.permissions,
  };
}

export async function resolveSession(
  db: AppDatabase,
  token: string | null | undefined,
): Promise<SessionResolution> {
  if (!token) {
    return { status: "missing" };
  }

  const row = await findSessionByTokenHash(db, hashToken(token));

  if (!row) {
    return { status: "missing" };
  }

  if (row.session.revokedAt) {
    return { status: "revoked" };
  }

  if (row.session.expiresAt.getTime() <= Date.now()) {
    return { status: "expired" };
  }

  if (!row.user.isActive) {
    return { status: "invalid" };
  }

  return {
    status: "valid",
    context: {
      sessionId: row.session.id,
      userId: row.user.id,
      businessId: row.user.businessId,
      roleId: row.role.id,
      roleCode: row.role.code,
      roleLabel: row.role.name,
      name: row.user.name,
      email: row.user.email,
      username: row.user.username,
      permissions: await listPermissionCodesForRole(db, row.role.id),
    },
  };
}

export async function login(
  db: AppDatabase,
  input: { identity: string; password: string; remember: boolean },
  ip: string,
) {
  const identity = input.identity.trim().toLowerCase();
  const rateKey = `${identity}:${ip}`;

  if (!allowLoginAttempt(rateKey)) {
    throw AppError.rateLimited();
  }

  const row = await findUserByIdentity(db, identity);
  const valid =
    row?.user.isActive &&
    (await verifyPassword(input.password, row.user.passwordHash));

  if (!row || !valid) {
    recordLoginFailure(rateKey);
    throw AppError.unauthorized(
      "AUTH_INVALID_CREDENTIALS",
      "Email, username, atau kata sandi tidak cocok.",
    );
  }

  clearLoginFailures(rateKey);

  const token = newToken();
  const createdAt = now();
  const expiresAt = new Date(
    createdAt.getTime() + (input.remember ? REMEMBER_TTL_MS : DEFAULT_TTL_MS),
  );

  await createSession(db, {
    id: newId(),
    userId: row.user.id,
    tokenHash: hashToken(token),
    expiresAt,
    createdAt,
  });

  const resolution = await resolveSession(db, token);

  if (resolution.status !== "valid") {
    throw AppError.internal();
  }

  return {
    user: toSessionUser(resolution.context),
    token,
    expiresAt,
  };
}

export async function logout(db: AppDatabase, token: string) {
  await revokeSessionByTokenHash(db, hashToken(token));
}

export async function changePassword(
  db: AppDatabase,
  context: AuthContext,
  input: { currentPassword: string; newPassword: string },
) {
  const row = await findUserById(db, context.userId);

  if (
    !row ||
    !(await verifyPassword(input.currentPassword, row.user.passwordHash))
  ) {
    throw new AppError({
      code: "AUTH_INVALID_CURRENT_PASSWORD",
      detail: "Kata sandi saat ini tidak cocok.",
      status: 400,
      title: "Kata sandi salah",
    });
  }

  const passwordHash = await hashPassword(input.newPassword);

  await db.transaction(async (tx) => {
    await updatePassword(tx, context.userId, passwordHash);
    await revokeOtherSessions(tx, context.userId, context.sessionId);
  });
}

import "server-only";

import { and, eq, isNull, ne, or } from "drizzle-orm";
import { roles, sessions, users } from "@/infrastructure/database/schema";
import type { DbExecutor } from "@/infrastructure/database/types";

async function roleForUser(db: DbExecutor, user: typeof users.$inferSelect) {
  const rows = await db
    .select()
    .from(roles)
    .where(eq(roles.id, user.roleId))
    .limit(1);

  return rows[0] ?? null;
}

export async function findUserByIdentity(db: DbExecutor, identity: string) {
  const rows = await db
    .select()
    .from(users)
    .where(or(eq(users.email, identity), eq(users.username, identity)))
    .limit(1);

  const user = rows[0];

  if (!user) {
    return null;
  }

  const role = await roleForUser(db, user);

  return role ? { user, role } : null;
}

export async function findUserById(db: DbExecutor, id: string) {
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);

  const user = rows[0];

  if (!user) {
    return null;
  }

  const role = await roleForUser(db, user);

  return role ? { user, role } : null;
}

export async function updatePassword(
  db: DbExecutor,
  id: string,
  passwordHash: string,
) {
  await db
    .update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.id, id));
}

export async function listUserRows(db: DbExecutor, businessId: string) {
  return db.select().from(users).where(eq(users.businessId, businessId));
}

export async function findRoleById(db: DbExecutor, id: string) {
  const rows = await db.select().from(roles).where(eq(roles.id, id)).limit(1);

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

export async function findUserByEmail(
  db: DbExecutor,
  email: string,
  exceptId?: string,
) {
  const rows = await db
    .select()
    .from(users)
    .where(
      exceptId
        ? and(eq(users.email, email), ne(users.id, exceptId))
        : eq(users.email, email),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function findUserByUsername(
  db: DbExecutor,
  username: string,
  exceptId?: string,
) {
  const rows = await db
    .select()
    .from(users)
    .where(
      exceptId
        ? and(eq(users.username, username), ne(users.id, exceptId))
        : eq(users.username, username),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function insertUser(
  db: DbExecutor,
  input: {
    id: string;
    businessId: string;
    roleId: string;
    name: string;
    email: string;
    username: string;
    passwordHash: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  },
) {
  await db.insert(users).values(input);
}

export async function updateUser(
  db: DbExecutor,
  id: string,
  input: {
    roleId: string;
    name: string;
    email: string;
    username: string;
    isActive: boolean;
    updatedAt: Date;
  },
) {
  await db.update(users).set(input).where(eq(users.id, id));
}

export async function countActiveOwners(
  db: DbExecutor,
  businessId: string,
  exceptUserId?: string,
) {
  const ownerRole = await findRoleByCode(db, businessId, "OWNER");

  if (!ownerRole) {
    return 0;
  }

  const rows = await db
    .select({ id: users.id })
    .from(users)
    .where(
      and(
        eq(users.businessId, businessId),
        eq(users.roleId, ownerRole.id),
        eq(users.isActive, true),
        exceptUserId ? ne(users.id, exceptUserId) : undefined,
      ),
    );

  return rows.length;
}

export async function revokeUserSessions(db: DbExecutor, userId: string) {
  await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)));
}

import "server-only";

import { eq, or } from "drizzle-orm";
import { roles, users } from "@/infrastructure/database/schema";
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

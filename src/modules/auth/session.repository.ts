import "server-only";

import { and, eq, isNull, ne } from "drizzle-orm";
import { sessions } from "@/infrastructure/database/schema";
import type { DbExecutor } from "@/infrastructure/database/types";
import { findUserById } from "@/modules/users/user.repository";

export async function createSession(
  db: DbExecutor,
  input: {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    createdAt: Date;
  },
) {
  await db.insert(sessions).values(input);
}

export async function findSessionByTokenHash(
  db: DbExecutor,
  tokenHash: string,
) {
  const rows = await db
    .select()
    .from(sessions)
    .where(eq(sessions.tokenHash, tokenHash))
    .limit(1);

  const session = rows[0];

  if (!session) {
    return null;
  }

  const user = await findUserById(db, session.userId);

  return user ? { session, user: user.user, role: user.role } : null;
}

export async function revokeSession(db: DbExecutor, id: string) {
  await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(sessions.id, id), isNull(sessions.revokedAt)));
}

export async function revokeSessionByTokenHash(
  db: DbExecutor,
  tokenHash: string,
) {
  await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(sessions.tokenHash, tokenHash), isNull(sessions.revokedAt)));
}

export async function revokeOtherSessions(
  db: DbExecutor,
  userId: string,
  currentSessionId: string,
) {
  await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(sessions.userId, userId),
        ne(sessions.id, currentSessionId),
        isNull(sessions.revokedAt),
      ),
    );
}

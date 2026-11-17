import "server-only";

import { cookies } from "next/headers";
import { getDb } from "@/infrastructure/database/client";
import { AppError } from "@/shared/errors/app-error";
import {
  type AuthContext,
  resolveSession,
  toSessionUser,
} from "./auth.service";

export const SESSION_COOKIE = "ravika_session";

export async function getSessionToken() {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

export async function setSessionCookie(token: string, expiresAt: Date) {
  const cookieStore = await cookies();

  cookieStore.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.RAVIKA_SESSION_COOKIE_SECURE === "true",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSessionCookie() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function requireAuth(): Promise<AuthContext> {
  const token = await getSessionToken();
  const { db } = await getDb();
  const resolution = await resolveSession(db, token);

  if (resolution.status === "valid") {
    return resolution.context;
  }

  if (resolution.status === "expired") {
    throw AppError.unauthorized(
      "AUTH_SESSION_EXPIRED",
      "Session sudah berakhir. Silakan masuk kembali.",
    );
  }

  if (resolution.status === "revoked") {
    throw AppError.unauthorized(
      "AUTH_SESSION_REVOKED",
      "Session sudah dicabut. Silakan masuk kembali.",
    );
  }

  throw AppError.unauthorized(
    "AUTH_SESSION_REQUIRED",
    "Session tidak ditemukan. Silakan masuk.",
  );
}

export async function getSessionUser() {
  return toSessionUser(await requireAuth());
}

import "server-only";

import { redirect } from "next/navigation";
import { getSessionUser } from "@/modules/auth/session";
import { AppError } from "@/shared/errors/app-error";
import type { SessionUser } from "@/types/auth";

export async function getOptionalLayoutSession(): Promise<SessionUser | null> {
  try {
    return await getSessionUser();
  } catch (error) {
    // Only an unauthenticated visitor is redirected; real failures reach the error boundary.
    if (error instanceof AppError && error.status === 401) {
      return null;
    }

    throw error;
  }
}

export async function requireLayoutSession(): Promise<SessionUser> {
  const user = await getOptionalLayoutSession();

  if (!user) {
    redirect("/login");
  }

  return user;
}

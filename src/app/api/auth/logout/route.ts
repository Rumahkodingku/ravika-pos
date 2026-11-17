import { getDb } from "@/infrastructure/database/client";
import { logout } from "@/modules/auth/auth.service";
import { clearSessionCookie, getSessionToken } from "@/modules/auth/session";
import { assertSameOrigin } from "@/shared/http/request-context";
import { noContent, withApi } from "@/shared/http/route-handler";

export const POST = withApi(async (request) => {
  assertSameOrigin(request);

  const token = await getSessionToken();

  if (token) {
    const { db } = await getDb();
    await logout(db, token);
  }

  await clearSessionCookie();

  return noContent();
});

import { getDb } from "@/infrastructure/database/client";
import { loginSchema } from "@/modules/auth/auth.schemas";
import { login as loginUser } from "@/modules/auth/auth.service";
import { setSessionCookie } from "@/modules/auth/session";
import { assertSameOrigin, getClientIp } from "@/shared/http/request-context";
import { json, parseJson, withApi } from "@/shared/http/route-handler";

export const POST = withApi(async (request) => {
  assertSameOrigin(request);

  const input = await parseJson(request, loginSchema);
  const { db } = await getDb();
  const result = await loginUser(db, input, getClientIp(request));

  await setSessionCookie(result.token, result.expiresAt);

  return json(result.user);
});

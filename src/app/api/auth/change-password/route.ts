import { getDb } from "@/infrastructure/database/client";
import { changePasswordSchema } from "@/modules/auth/auth.schemas";
import { changePassword } from "@/modules/auth/auth.service";
import { requireAuth } from "@/modules/auth/session";
import { assertSameOrigin } from "@/shared/http/request-context";
import { noContent, parseJson, withApi } from "@/shared/http/route-handler";

export const POST = withApi(async (request) => {
  assertSameOrigin(request);

  const context = await requireAuth();
  const input = await parseJson(request, changePasswordSchema);
  const { db } = await getDb();

  await changePassword(db, context, input);

  return noContent();
});

import { getDb } from "@/infrastructure/database/client";
import { requireAuth } from "@/modules/auth/session";
import { requirePermission } from "@/modules/rbac/authorization";
import { userResetPasswordSchema } from "@/modules/users/user.schemas";
import { resetUserPassword } from "@/modules/users/user.service";
import { assertSameOrigin } from "@/shared/http/request-context";
import { parseJson, withApi } from "@/shared/http/route-handler";

type Context = { params: Promise<{ id: string }> };

export const POST = withApi<Context>(async (request, context) => {
  assertSameOrigin(request);

  const auth = await requireAuth();
  requirePermission(auth, "users.manage");

  const { id } = await context.params;
  const input = await parseJson(request, userResetPasswordSchema);
  const { db } = await getDb();

  await resetUserPassword(db, auth.businessId, id, input.password, auth.userId);

  return new Response(null, { status: 204 });
});

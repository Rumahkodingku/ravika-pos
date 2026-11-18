import { getDb } from "@/infrastructure/database/client";
import { requireAuth } from "@/modules/auth/session";
import { requirePermission } from "@/modules/rbac/authorization";
import { userUpdateSchema } from "@/modules/users/user.schemas";
import { getUser, updateUserById } from "@/modules/users/user.service";
import { assertSameOrigin } from "@/shared/http/request-context";
import { json, parseJson, withApi } from "@/shared/http/route-handler";

type Context = { params: Promise<{ id: string }> };

export const GET = withApi<Context>(async (_request, context) => {
  const auth = await requireAuth();
  requirePermission(auth, "users.view");

  const { id } = await context.params;
  const { db } = await getDb();

  return json(await getUser(db, auth.businessId, id));
});

export const PATCH = withApi<Context>(async (request, context) => {
  assertSameOrigin(request);

  const auth = await requireAuth();
  requirePermission(auth, "users.manage");

  const { id } = await context.params;
  const input = await parseJson(request, userUpdateSchema);
  const { db } = await getDb();

  return json(await updateUserById(db, auth.businessId, id, input));
});

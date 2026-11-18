import { getDb } from "@/infrastructure/database/client";
import { requireAuth } from "@/modules/auth/session";
import { requirePermission } from "@/modules/rbac/authorization";
import { roleUpdateSchema } from "@/modules/roles/role.schemas";
import { getRole, updateRole } from "@/modules/roles/role.service";
import { assertSameOrigin } from "@/shared/http/request-context";
import { json, parseJson, withApi } from "@/shared/http/route-handler";

type Context = { params: Promise<{ id: string }> };

export const GET = withApi<Context>(async (_request, context) => {
  const auth = await requireAuth();
  requirePermission(auth, "roles.manage");

  const { id } = await context.params;
  const { db } = await getDb();

  return json(await getRole(db, auth.businessId, id));
});

export const PATCH = withApi<Context>(async (request, context) => {
  assertSameOrigin(request);

  const auth = await requireAuth();
  requirePermission(auth, "roles.manage");

  const { id } = await context.params;
  const input = await parseJson(request, roleUpdateSchema);
  const { db } = await getDb();

  return json(await updateRole(db, auth.businessId, id, input));
});

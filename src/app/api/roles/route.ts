import { getDb } from "@/infrastructure/database/client";
import { requireAuth } from "@/modules/auth/session";
import { requirePermission } from "@/modules/rbac/authorization";
import { roleCreateSchema } from "@/modules/roles/role.schemas";
import { createRole, listRoles } from "@/modules/roles/role.service";
import { assertSameOrigin } from "@/shared/http/request-context";
import { json, parseJson, withApi } from "@/shared/http/route-handler";

export const GET = withApi(async () => {
  const context = await requireAuth();
  requirePermission(context, "roles.manage");

  const { db } = await getDb();

  return json(await listRoles(db, context.businessId));
});

export const POST = withApi(async (request) => {
  assertSameOrigin(request);

  const context = await requireAuth();
  requirePermission(context, "roles.manage");

  const input = await parseJson(request, roleCreateSchema);
  const { db } = await getDb();

  return json(await createRole(db, context.businessId, input), { status: 201 });
});

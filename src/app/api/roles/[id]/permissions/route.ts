import { getDb } from "@/infrastructure/database/client";
import { requireAuth } from "@/modules/auth/session";
import { requirePermission } from "@/modules/rbac/authorization";
import { rolePermissionsSchema } from "@/modules/roles/role.schemas";
import { setRolePermissions } from "@/modules/roles/role.service";
import { assertSameOrigin } from "@/shared/http/request-context";
import { json, parseJson, withApi } from "@/shared/http/route-handler";

type Context = { params: Promise<{ id: string }> };

export const PUT = withApi<Context>(async (request, context) => {
  assertSameOrigin(request);

  const auth = await requireAuth();
  requirePermission(auth, "permissions.manage");

  const { id } = await context.params;
  const input = await parseJson(request, rolePermissionsSchema);
  const { db } = await getDb();

  return json(
    await setRolePermissions(db, auth.businessId, id, input.permissionCodes),
  );
});

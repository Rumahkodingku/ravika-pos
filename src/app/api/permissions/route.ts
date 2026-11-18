import { requireAuth } from "@/modules/auth/session";
import { requirePermission } from "@/modules/rbac/authorization";
import { listPermissions } from "@/modules/roles/role.service";
import { json, withApi } from "@/shared/http/route-handler";

export const GET = withApi(async () => {
  const context = await requireAuth();
  requirePermission(context, "permissions.manage");

  return json(listPermissions());
});

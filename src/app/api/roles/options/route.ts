import { getDb } from "@/infrastructure/database/client";
import { requireAuth } from "@/modules/auth/session";
import { requirePermission } from "@/modules/rbac/authorization";
import { listRoleOptions } from "@/modules/roles/role.service";
import { json, withApi } from "@/shared/http/route-handler";

export const GET = withApi(async () => {
  const context = await requireAuth();
  requirePermission(context, "users.view");

  const { db } = await getDb();

  return json(await listRoleOptions(db, context.businessId));
});

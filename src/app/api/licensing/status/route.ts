import { getDb } from "@/infrastructure/database/client";
import { requireAuth } from "@/modules/auth/session";
import { getLicenseStatus } from "@/modules/license/license.service";
import { requirePermission } from "@/modules/rbac/authorization";
import { json, withApi } from "@/shared/http/route-handler";

export const GET = withApi(async () => {
  const context = await requireAuth();
  requirePermission(context, "license.view");

  const { db } = await getDb();

  return json(await getLicenseStatus(db));
});

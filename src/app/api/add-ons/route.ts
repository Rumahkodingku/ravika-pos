import { getDb } from "@/infrastructure/database/client";
import { requireAuth } from "@/modules/auth/session";
import { listAddOns } from "@/modules/catalog/catalog.service";
import { requirePermission } from "@/modules/rbac/authorization";
import { json, withApi } from "@/shared/http/route-handler";

export const GET = withApi(async () => {
  const context = await requireAuth();
  requirePermission(context, "products.view");

  const { db } = await getDb();

  return json(await listAddOns(db, context.businessId));
});

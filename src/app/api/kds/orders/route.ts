import { getDb } from "@/infrastructure/database/client";
import { requireAuth } from "@/modules/auth/session";
import { listKdsOrders } from "@/modules/orders/order.service";
import { requirePermission } from "@/modules/rbac/authorization";
import { json, withApi } from "@/shared/http/route-handler";

export const GET = withApi(async () => {
  const context = await requireAuth();
  requirePermission(context, "kds.view");

  const { db } = await getDb();

  return json(await listKdsOrders(db, context.businessId));
});

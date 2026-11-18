import { getDb } from "@/infrastructure/database/client";
import { requireAuth } from "@/modules/auth/session";
import { listPayableOrders } from "@/modules/orders/order.service";
import { requirePermission } from "@/modules/rbac/authorization";
import { json, withApi } from "@/shared/http/route-handler";

export const GET = withApi(async () => {
  const context = await requireAuth();
  requirePermission(context, "payments.view");

  const { db } = await getDb();

  return json(await listPayableOrders(db, context.businessId));
});

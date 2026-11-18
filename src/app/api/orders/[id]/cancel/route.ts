import { getDb } from "@/infrastructure/database/client";
import { requireAuth } from "@/modules/auth/session";
import { cancelOrderSchema } from "@/modules/orders/order.schemas";
import { cancelOrder } from "@/modules/orders/order.service";
import { requirePermission } from "@/modules/rbac/authorization";
import { assertSameOrigin } from "@/shared/http/request-context";
import { json, parseJson, withApi } from "@/shared/http/route-handler";

type Context = { params: Promise<{ id: string }> };

export const POST = withApi<Context>(async (request, context) => {
  assertSameOrigin(request);

  const auth = await requireAuth();
  requirePermission(auth, "orders.cancel");

  const { id } = await context.params;
  const input = await parseJson(request, cancelOrderSchema);
  const { db } = await getDb();

  return json(
    await cancelOrder(db, auth.businessId, id, input.reason, auth.userId),
  );
});

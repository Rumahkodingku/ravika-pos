import { getDb } from "@/infrastructure/database/client";
import { requireAuth } from "@/modules/auth/session";
import { getPayment } from "@/modules/payments/payment.service";
import { requirePermission } from "@/modules/rbac/authorization";
import { json, withApi } from "@/shared/http/route-handler";

type Context = { params: Promise<{ id: string }> };

export const GET = withApi<Context>(async (_request, context) => {
  const auth = await requireAuth();
  requirePermission(auth, "payments.view");

  const { id } = await context.params;
  const { db } = await getDb();

  return json(await getPayment(db, auth.businessId, id));
});

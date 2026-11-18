import { getDb } from "@/infrastructure/database/client";
import { requireAuth } from "@/modules/auth/session";
import { listPayments } from "@/modules/payments/payment.service";
import { requirePermission } from "@/modules/rbac/authorization";
import { json, withApi } from "@/shared/http/route-handler";
import { numberParam } from "@/shared/pagination";

export const GET = withApi(async (request) => {
  const context = await requireAuth();
  requirePermission(context, "payments.view");

  const { db } = await getDb();
  const query = new URL(request.url).searchParams;

  return json(
    await listPayments(db, context.businessId, {
      search: query.get("search") ?? undefined,
      method: query.get("method") ?? undefined,
      status: query.get("status") ?? undefined,
      dateFrom: query.get("dateFrom") ?? undefined,
      dateTo: query.get("dateTo") ?? undefined,
      page: numberParam(query.get("page"), 1),
      pageSize: numberParam(query.get("pageSize"), 10),
    }),
  );
});

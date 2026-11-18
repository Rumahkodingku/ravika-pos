import { getDb } from "@/infrastructure/database/client";
import { requireAuth } from "@/modules/auth/session";
import { requirePermission } from "@/modules/rbac/authorization";
import { getTopProducts } from "@/modules/reports/report.service";
import { json, withApi } from "@/shared/http/route-handler";
import { numberParam } from "@/shared/pagination";

export const GET = withApi(async (request) => {
  const context = await requireAuth();
  requirePermission(context, "reports.view");

  const { db } = await getDb();
  const query = new URL(request.url).searchParams;

  return json(
    await getTopProducts(db, context.businessId, {
      dateFrom: query.get("dateFrom") ?? undefined,
      dateTo: query.get("dateTo") ?? undefined,
      limit: numberParam(query.get("limit"), 5),
    }),
  );
});

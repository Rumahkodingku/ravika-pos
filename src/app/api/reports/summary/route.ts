import { getDb } from "@/infrastructure/database/client";
import { requireAuth } from "@/modules/auth/session";
import { requirePermission } from "@/modules/rbac/authorization";
import { getSummary } from "@/modules/reports/report.service";
import { json, withApi } from "@/shared/http/route-handler";
import type { DashboardFilters } from "@/types/api";

export const GET = withApi(async (request) => {
  const context = await requireAuth();
  requirePermission(context, "reports.view");

  const { db } = await getDb();
  const searchParams = new URL(request.url).searchParams;
  const filters: DashboardFilters = {
    dateFrom: searchParams.get("dateFrom") ?? undefined,
    dateTo: searchParams.get("dateTo") ?? undefined,
    orderStatus: searchParams.get("orderStatus") ?? undefined,
    orderType: searchParams.get("orderType") ?? undefined,
    paymentStatus: searchParams.get("paymentStatus") ?? undefined,
    range: searchParams.get("range") ?? undefined,
    source: searchParams.get("source") ?? undefined,
  };

  return json(await getSummary(db, context.businessId, filters));
});

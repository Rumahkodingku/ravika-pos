import { getDb } from "@/infrastructure/database/client";
import { requireAuth } from "@/modules/auth/session";
import { requirePermission } from "@/modules/rbac/authorization";
import { getSummary } from "@/modules/reports/report.service";
import { json, withApi } from "@/shared/http/route-handler";

export const GET = withApi(async (request) => {
  const context = await requireAuth();
  requirePermission(context, "reports.view");

  const { db } = await getDb();
  const range = new URL(request.url).searchParams.get("range") ?? undefined;

  return json(await getSummary(db, context.businessId, range));
});

import { getDb } from "@/infrastructure/database/client";
import { requireAuth } from "@/modules/auth/session";
import { businessSchema } from "@/modules/business/business.schemas";
import {
  getBusiness,
  updateBusiness,
} from "@/modules/business/business.service";
import { requirePermission } from "@/modules/rbac/authorization";
import { assertSameOrigin } from "@/shared/http/request-context";
import { json, parseJson, withApi } from "@/shared/http/route-handler";

export const GET = withApi(async () => {
  const context = await requireAuth();
  requirePermission(context, "business.view");

  const { db } = await getDb();

  return json(await getBusiness(db, context.businessId));
});

export const PATCH = withApi(async (request) => {
  assertSameOrigin(request);

  const context = await requireAuth();
  requirePermission(context, "business.update");

  const input = await parseJson(request, businessSchema);
  const { db } = await getDb();

  return json(await updateBusiness(db, context.businessId, input));
});

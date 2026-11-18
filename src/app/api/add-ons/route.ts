import { getDb } from "@/infrastructure/database/client";
import { requireAuth } from "@/modules/auth/session";
import { addOnSchema } from "@/modules/catalog/catalog.schemas";
import { createAddOn, listAddOns } from "@/modules/catalog/catalog.service";
import { requirePermission } from "@/modules/rbac/authorization";
import { assertSameOrigin } from "@/shared/http/request-context";
import { json, parseJson, withApi } from "@/shared/http/route-handler";

export const GET = withApi(async () => {
  const context = await requireAuth();
  requirePermission(context, "products.view");

  const { db } = await getDb();

  return json(await listAddOns(db, context.businessId));
});

export const POST = withApi(async (request) => {
  assertSameOrigin(request);

  const context = await requireAuth();
  requirePermission(context, "products.manage");

  const input = await parseJson(request, addOnSchema);
  const { db } = await getDb();

  return json(await createAddOn(db, context.businessId, input), {
    status: 201,
  });
});

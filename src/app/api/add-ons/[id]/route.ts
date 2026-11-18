import { getDb } from "@/infrastructure/database/client";
import { requireAuth } from "@/modules/auth/session";
import { addOnSchema } from "@/modules/catalog/catalog.schemas";
import { updateAddOn } from "@/modules/catalog/catalog.service";
import { requirePermission } from "@/modules/rbac/authorization";
import { assertSameOrigin } from "@/shared/http/request-context";
import { json, parseJson, withApi } from "@/shared/http/route-handler";

type Context = { params: Promise<{ id: string }> };

export const PATCH = withApi<Context>(async (request, context) => {
  assertSameOrigin(request);

  const auth = await requireAuth();
  requirePermission(auth, "products.manage");

  const { id } = await context.params;
  const input = await parseJson(request, addOnSchema);
  const { db } = await getDb();

  return json(await updateAddOn(db, auth.businessId, id, input));
});

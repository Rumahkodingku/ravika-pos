import { getDb } from "@/infrastructure/database/client";
import { requireAuth } from "@/modules/auth/session";
import { productSchema } from "@/modules/catalog/catalog.schemas";
import { getProduct, updateProduct } from "@/modules/catalog/catalog.service";
import { requirePermission } from "@/modules/rbac/authorization";
import { assertSameOrigin } from "@/shared/http/request-context";
import { json, parseJson, withApi } from "@/shared/http/route-handler";

type Context = { params: Promise<{ id: string }> };

export const GET = withApi<Context>(async (_request, context) => {
  const auth = await requireAuth();
  requirePermission(auth, "products.view");

  const { id } = await context.params;
  const { db } = await getDb();

  return json(await getProduct(db, auth.businessId, id));
});

export const PATCH = withApi<Context>(async (request, context) => {
  assertSameOrigin(request);

  const auth = await requireAuth();
  requirePermission(auth, "products.manage");

  const { id } = await context.params;
  const input = await parseJson(request, productSchema);
  const { db } = await getDb();

  return json(await updateProduct(db, auth.businessId, id, input));
});

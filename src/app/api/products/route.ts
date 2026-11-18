import { getDb } from "@/infrastructure/database/client";
import { requireAuth } from "@/modules/auth/session";
import { productSchema } from "@/modules/catalog/catalog.schemas";
import { createProduct, listProducts } from "@/modules/catalog/catalog.service";
import { requirePermission } from "@/modules/rbac/authorization";
import { assertSameOrigin } from "@/shared/http/request-context";
import { json, parseJson, withApi } from "@/shared/http/route-handler";
import { numberParam } from "@/shared/pagination";

export const GET = withApi(async (request) => {
  const context = await requireAuth();
  requirePermission(context, "products.view");

  const { db } = await getDb();
  const query = new URL(request.url).searchParams;

  return json(
    await listProducts(db, context.businessId, {
      search: query.get("search") ?? undefined,
      categoryId: query.get("categoryId") ?? undefined,
      active: query.get("active") ?? undefined,
      availability: query.get("availability") ?? undefined,
      sortBy: query.get("sort") ?? undefined,
      sortDir: query.get("sortDir") === "desc" ? "desc" : "asc",
      page: numberParam(query.get("page"), 1),
      pageSize: numberParam(query.get("pageSize"), 10),
    }),
  );
});

export const POST = withApi(async (request) => {
  assertSameOrigin(request);

  const context = await requireAuth();
  requirePermission(context, "products.manage");

  const input = await parseJson(request, productSchema);
  const { db } = await getDb();

  return json(await createProduct(db, context.businessId, input), {
    status: 201,
  });
});

import { getDb } from "@/infrastructure/database/client";
import { requireAuth } from "@/modules/auth/session";
import { categorySchema } from "@/modules/catalog/catalog.schemas";
import {
  createCategory,
  listCategories,
} from "@/modules/catalog/catalog.service";
import { requirePermission } from "@/modules/rbac/authorization";
import { assertSameOrigin } from "@/shared/http/request-context";
import { json, parseJson, withApi } from "@/shared/http/route-handler";
import { numberParam } from "@/shared/pagination";

export const GET = withApi(async (request) => {
  const context = await requireAuth();
  requirePermission(context, "categories.view");

  const { db } = await getDb();
  const query = new URL(request.url).searchParams;

  return json(
    await listCategories(db, context.businessId, {
      search: query.get("search") ?? undefined,
      active: query.get("active") ?? undefined,
      page: numberParam(query.get("page"), 1),
      pageSize: numberParam(query.get("pageSize"), 10),
    }),
  );
});

export const POST = withApi(async (request) => {
  assertSameOrigin(request);

  const context = await requireAuth();
  requirePermission(context, "categories.manage");

  const input = await parseJson(request, categorySchema);
  const { db } = await getDb();

  return json(await createCategory(db, context.businessId, input), {
    status: 201,
  });
});

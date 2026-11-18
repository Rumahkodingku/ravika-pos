import { getDb } from "@/infrastructure/database/client";
import { requireAuth } from "@/modules/auth/session";
import { requirePermission } from "@/modules/rbac/authorization";
import { tableSchema } from "@/modules/tables/table.schemas";
import { createTable, listTables } from "@/modules/tables/table.service";
import { assertSameOrigin } from "@/shared/http/request-context";
import { json, parseJson, withApi } from "@/shared/http/route-handler";
import { numberParam } from "@/shared/pagination";

export const GET = withApi(async (request) => {
  const context = await requireAuth();
  requirePermission(context, "tables.view");

  const { db } = await getDb();
  const query = new URL(request.url).searchParams;

  return json(
    await listTables(db, {
      search: query.get("search") ?? undefined,
      status: query.get("status") ?? undefined,
      page: numberParam(query.get("page"), 1),
      pageSize: numberParam(query.get("pageSize"), 10),
    }),
  );
});

export const POST = withApi(async (request) => {
  assertSameOrigin(request);

  const context = await requireAuth();
  requirePermission(context, "tables.manage");

  const input = await parseJson(request, tableSchema);
  const { db } = await getDb();

  return json(await createTable(db, input), { status: 201 });
});

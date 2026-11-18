import { getDb } from "@/infrastructure/database/client";
import { requireAuth } from "@/modules/auth/session";
import { requirePermission } from "@/modules/rbac/authorization";
import { tableSchema } from "@/modules/tables/table.schemas";
import { getTable, updateTableById } from "@/modules/tables/table.service";
import { assertSameOrigin } from "@/shared/http/request-context";
import { json, parseJson, withApi } from "@/shared/http/route-handler";

type Context = { params: Promise<{ id: string }> };

export const GET = withApi<Context>(async (_request, context) => {
  const auth = await requireAuth();
  requirePermission(auth, "tables.view");

  const { id } = await context.params;
  const { db } = await getDb();

  return json(await getTable(db, id));
});

export const PATCH = withApi<Context>(async (request, context) => {
  assertSameOrigin(request);

  const auth = await requireAuth();
  requirePermission(auth, "tables.manage");

  const { id } = await context.params;
  const input = await parseJson(request, tableSchema);
  const { db } = await getDb();

  return json(await updateTableById(db, id, input));
});

import { getDb } from "@/infrastructure/database/client";
import { requireAuth } from "@/modules/auth/session";
import { requirePermission } from "@/modules/rbac/authorization";
import { regenerateTableToken } from "@/modules/tables/table.service";
import { assertSameOrigin } from "@/shared/http/request-context";
import { json, withApi } from "@/shared/http/route-handler";

type Context = { params: Promise<{ id: string }> };

export const POST = withApi<Context>(async (request, context) => {
  assertSameOrigin(request);

  const auth = await requireAuth();
  requirePermission(auth, "tables.manage");

  const { id } = await context.params;
  const { db } = await getDb();

  return json(await regenerateTableToken(db, id));
});

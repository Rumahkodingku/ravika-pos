import { getDb } from "@/infrastructure/database/client";
import { requireAuth } from "@/modules/auth/session";
import { categoryMoveSchema } from "@/modules/catalog/catalog.schemas";
import { moveCategory } from "@/modules/catalog/catalog.service";
import { requirePermission } from "@/modules/rbac/authorization";
import { assertSameOrigin } from "@/shared/http/request-context";
import { json, parseJson, withApi } from "@/shared/http/route-handler";

type Context = { params: Promise<{ id: string }> };

export const POST = withApi<Context>(async (request, context) => {
  assertSameOrigin(request);

  const auth = await requireAuth();
  requirePermission(auth, "categories.manage");

  const { id } = await context.params;
  const input = await parseJson(request, categoryMoveSchema);
  const { db } = await getDb();

  return json(await moveCategory(db, auth.businessId, id, input.direction));
});

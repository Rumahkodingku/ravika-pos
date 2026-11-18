import { getDb } from "@/infrastructure/database/client";
import { requireAuth } from "@/modules/auth/session";
import { requirePermission } from "@/modules/rbac/authorization";
import { userCreateSchema } from "@/modules/users/user.schemas";
import { createUser, listUsers } from "@/modules/users/user.service";
import { assertSameOrigin } from "@/shared/http/request-context";
import { json, parseJson, withApi } from "@/shared/http/route-handler";
import { numberParam } from "@/shared/pagination";

export const GET = withApi(async (request) => {
  const context = await requireAuth();
  requirePermission(context, "users.view");

  const { db } = await getDb();
  const query = new URL(request.url).searchParams;

  return json(
    await listUsers(db, context.businessId, {
      search: query.get("search") ?? undefined,
      role: query.get("role") ?? undefined,
      active: query.get("active") ?? undefined,
      page: numberParam(query.get("page"), 1),
      pageSize: numberParam(query.get("pageSize"), 10),
    }),
  );
});

export const POST = withApi(async (request) => {
  assertSameOrigin(request);

  const context = await requireAuth();
  requirePermission(context, "users.manage");

  const input = await parseJson(request, userCreateSchema);
  const { db } = await getDb();

  return json(await createUser(db, context.businessId, input), { status: 201 });
});

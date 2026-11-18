import { getDb } from "@/infrastructure/database/client";
import { requireAuth } from "@/modules/auth/session";
import { orderCreateSchema } from "@/modules/orders/order.schemas";
import { createOrder, listOrders } from "@/modules/orders/order.service";
import { requirePermission } from "@/modules/rbac/authorization";
import { beginIdempotent } from "@/shared/http/idempotency";
import { assertSameOrigin } from "@/shared/http/request-context";
import { json, parseJson, withApi } from "@/shared/http/route-handler";
import { numberParam } from "@/shared/pagination";

export const GET = withApi(async (request) => {
  const context = await requireAuth();
  requirePermission(context, "orders.view");

  const { db } = await getDb();
  const query = new URL(request.url).searchParams;

  return json(
    await listOrders(db, context.businessId, {
      search: query.get("search") ?? undefined,
      orderStatus: query.get("orderStatus") ?? undefined,
      paymentStatus: query.get("paymentStatus") ?? undefined,
      dateFrom: query.get("dateFrom") ?? undefined,
      dateTo: query.get("dateTo") ?? undefined,
      sortDir: query.get("sort") === "asc" ? "asc" : "desc",
      page: numberParam(query.get("page"), 1),
      pageSize: numberParam(query.get("pageSize"), 10),
    }),
  );
});

export const POST = withApi(async (request) => {
  assertSameOrigin(request);

  const context = await requireAuth();
  requirePermission(context, "orders.create");

  const input = await parseJson(request, orderCreateSchema);
  const { db } = await getDb();
  const idempotency = await beginIdempotent(db, request, {
    businessId: context.businessId,
    operation: "CREATE_ORDER",
    payload: input,
    actorId: context.userId,
  });

  if (idempotency.response) {
    return idempotency.response;
  }

  return json(
    await createOrder(db, context.businessId, input, context.userId, {
      key: idempotency.key,
      hash: idempotency.hash,
    }),
    { status: 201 },
  );
});

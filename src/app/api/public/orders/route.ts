import { getDb } from "@/infrastructure/database/client";
import { findFirstBusiness } from "@/modules/business/business.repository";
import { publicOrderCreateSchema } from "@/modules/orders/order.schemas";
import { createPublicOrder } from "@/modules/orders/order.service";
import { AppError } from "@/shared/errors/app-error";
import { beginIdempotent } from "@/shared/http/idempotency";
import { getClientIp } from "@/shared/http/request-context";
import { json, parseJson, withApi } from "@/shared/http/route-handler";
import { consumeRateLimit } from "@/shared/rate-limit";

export const POST = withApi(async (request) => {
  if (!consumeRateLimit(`public-order:${getClientIp(request)}`, 10, 60_000)) {
    throw AppError.rateLimited();
  }

  const input = await parseJson(request, publicOrderCreateSchema);
  const { db } = await getDb();
  const business = await findFirstBusiness(db);

  if (!business) {
    throw AppError.internal();
  }

  const idempotency = await beginIdempotent(db, request, {
    businessId: business.id,
    operation: "CREATE_PUBLIC_ORDER",
    payload: input,
  });

  if (idempotency.response) {
    return idempotency.response;
  }

  const order = await createPublicOrder(
    db,
    business.id,
    {
      orderType: "DINE_IN",
      tableId: null,
      notes: input.notes,
      items: input.items,
    },
    input.tableToken,
    { key: idempotency.key, hash: idempotency.hash },
  );

  return json(
    {
      orderNumber: order.orderNumber,
      publicToken: order.publicToken,
      grandTotal: order.grandTotal,
      tableName: order.tableName ?? null,
    },
    { status: 201 },
  );
});

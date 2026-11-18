import { getDb } from "@/infrastructure/database/client";
import { requireAuth } from "@/modules/auth/session";
import { refundSchema } from "@/modules/payments/payment.schemas";
import { refundOrder } from "@/modules/payments/payment.service";
import { requirePermission } from "@/modules/rbac/authorization";
import { beginIdempotent } from "@/shared/http/idempotency";
import { assertSameOrigin } from "@/shared/http/request-context";
import { json, parseJson, withApi } from "@/shared/http/route-handler";

type Context = { params: Promise<{ id: string }> };

export const POST = withApi<Context>(async (request, context) => {
  assertSameOrigin(request);

  const auth = await requireAuth();
  requirePermission(auth, "payments.refund");

  const { id } = await context.params;
  const input = await parseJson(request, refundSchema);
  const { db } = await getDb();
  const idempotency = await beginIdempotent(db, request, {
    businessId: auth.businessId,
    operation: "REFUND_ORDER",
    payload: input,
    actorId: auth.userId,
  });

  if (idempotency.response) {
    return idempotency.response;
  }

  return json(
    await refundOrder(db, auth.businessId, id, input.reason, auth.userId, {
      key: idempotency.key,
      hash: idempotency.hash,
    }),
    { status: 201 },
  );
});

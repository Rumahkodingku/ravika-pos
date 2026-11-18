import { getDb } from "@/infrastructure/database/client";
import { requireAuth } from "@/modules/auth/session";
import { paymentCreateSchema } from "@/modules/payments/payment.schemas";
import {
  listOrderPayments,
  recordPayment,
} from "@/modules/payments/payment.service";
import { requirePermission } from "@/modules/rbac/authorization";
import { beginIdempotent } from "@/shared/http/idempotency";
import { assertSameOrigin } from "@/shared/http/request-context";
import { json, parseJson, withApi } from "@/shared/http/route-handler";

type Context = { params: Promise<{ id: string }> };

export const GET = withApi<Context>(async (_request, context) => {
  const auth = await requireAuth();
  requirePermission(auth, "payments.view");

  const { id } = await context.params;
  const { db } = await getDb();

  return json(await listOrderPayments(db, auth.businessId, id));
});

export const POST = withApi<Context>(async (request, context) => {
  assertSameOrigin(request);

  const auth = await requireAuth();
  requirePermission(auth, "payments.create");

  const { id } = await context.params;
  const input = await parseJson(request, paymentCreateSchema);
  const { db } = await getDb();
  const idempotency = await beginIdempotent(db, request, {
    businessId: auth.businessId,
    operation: "RECORD_PAYMENT",
    payload: input,
    actorId: auth.userId,
  });

  if (idempotency.response) {
    return idempotency.response;
  }

  return json(
    await recordPayment(db, auth.businessId, id, input, auth.userId, {
      key: idempotency.key,
      hash: idempotency.hash,
    }),
    { status: 201 },
  );
});

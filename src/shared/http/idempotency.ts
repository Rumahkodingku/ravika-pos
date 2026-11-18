import "server-only";

import type { AppDatabase } from "@/infrastructure/database/types";
import {
  findIdempotentResponse,
  type IdempotencyOperation,
  requestHash,
  requireIdempotencyKey,
} from "@/modules/idempotency/idempotency.service";
import { json } from "@/shared/http/route-handler";

export async function beginIdempotent(
  db: AppDatabase,
  request: Request,
  input: {
    businessId: string;
    operation: IdempotencyOperation;
    payload: unknown;
    actorId?: string | null;
  },
) {
  const key = requireIdempotencyKey(request);
  const hash = requestHash({
    payload: input.payload,
    actorId: input.actorId ?? null,
  });
  const replay = await findIdempotentResponse(db, {
    businessId: input.businessId,
    key,
    operation: input.operation,
    hash,
  });

  return {
    key,
    hash,
    response: replay
      ? json(replay.body, {
          status: replay.status,
          headers: { "idempotency-replayed": "true" },
        })
      : null,
  };
}

import "server-only";

import { and, eq, lt } from "drizzle-orm";
import { idempotencyKeys } from "@/infrastructure/database/schema";
import type { DbExecutor } from "@/infrastructure/database/types";
import { AppError } from "@/shared/errors/app-error";
import { hashToken, newId } from "@/shared/ids";
import { stableStringify } from "@/shared/stable-json";
import { now } from "@/shared/time";

export type IdempotencyOperation =
  | "CREATE_ORDER"
  | "CREATE_PUBLIC_ORDER"
  | "RECORD_PAYMENT"
  | "REFUND_ORDER";

export function requireIdempotencyKey(request: Request) {
  const key = request.headers.get("idempotency-key")?.trim();

  if (!key || key.length < 8 || key.length > 128) {
    throw AppError.validation([
      {
        path: "Idempotency-Key",
        message: "Header Idempotency-Key 8 sampai 128 karakter wajib diisi.",
      },
    ]);
  }

  return key;
}

export function requestHash(input: unknown) {
  return hashToken(stableStringify(input));
}

export async function findIdempotentResponse(
  db: DbExecutor,
  input: {
    businessId: string;
    key: string;
    operation: IdempotencyOperation;
    hash: string;
  },
) {
  const rows = await db
    .select()
    .from(idempotencyKeys)
    .where(
      and(
        eq(idempotencyKeys.businessId, input.businessId),
        eq(idempotencyKeys.operation, input.operation),
        eq(idempotencyKeys.key, input.key),
      ),
    )
    .limit(1);

  const row = rows[0];

  if (!row) {
    return null;
  }

  if (row.requestHash !== input.hash) {
    throw AppError.conflict(
      "IDEMPOTENCY_KEY_REUSED",
      "Idempotency-Key sudah dipakai untuk request berbeda.",
    );
  }

  return {
    status: row.responseStatus,
    body: JSON.parse(row.responseBody) as unknown,
  };
}

export async function saveIdempotentResponse(
  db: DbExecutor,
  input: {
    businessId: string;
    key: string;
    operation: IdempotencyOperation;
    hash: string;
    resourceType: string;
    resourceId: string;
    status: number;
    body: unknown;
  },
) {
  const createdAt = now();
  const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);

  await db
    .delete(idempotencyKeys)
    .where(lt(idempotencyKeys.expiresAt, createdAt));

  await db.insert(idempotencyKeys).values({
    id: newId(),
    businessId: input.businessId,
    key: input.key,
    operation: input.operation,
    requestHash: input.hash,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    responseStatus: input.status,
    responseBody: stableStringify(input.body),
    createdAt,
    expiresAt,
  });
}

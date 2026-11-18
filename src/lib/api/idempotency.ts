import { ApiError } from "@/lib/api/errors";

export function createIdempotencyKey(): string {
  return crypto.randomUUID();
}

export function idempotencyHeaders(key: string): HeadersInit {
  return { "Idempotency-Key": key };
}

// Network and 5xx failures may have been applied by the server, so the retry
// must reuse the key. A 4xx means the request was rejected and must rotate it.
export function shouldRotateIdempotencyKey(error: unknown) {
  return error instanceof ApiError && error.status >= 400 && error.status < 500;
}

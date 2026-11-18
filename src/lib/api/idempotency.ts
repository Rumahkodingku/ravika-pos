export function createIdempotencyKey(): string {
  return crypto.randomUUID();
}

export function idempotencyHeaders(key: string): HeadersInit {
  return { "Idempotency-Key": key };
}

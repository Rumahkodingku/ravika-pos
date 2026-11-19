import { ApiError } from "@/lib/api/errors";

export function createIdempotencyKey(): string {
  if (typeof crypto !== "undefined") {
    if (typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }

    if (typeof crypto.getRandomValues === "function") {
      const bytes = crypto.getRandomValues(new Uint8Array(16));
      bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40;
      bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;
      const hex = Array.from(bytes, (byte) =>
        byte.toString(16).padStart(2, "0"),
      ).join("");

      return [
        hex.slice(0, 8),
        hex.slice(8, 12),
        hex.slice(12, 16),
        hex.slice(16, 20),
        hex.slice(20),
      ].join("-");
    }
  }

  return `key-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function idempotencyHeaders(key: string): HeadersInit {
  return { "Idempotency-Key": key };
}

// Network and 5xx failures may have been applied by the server, so the retry
// must reuse the key. A 4xx means the request was rejected and must rotate it.
export function shouldRotateIdempotencyKey(error: unknown) {
  return error instanceof ApiError && error.status >= 400 && error.status < 500;
}

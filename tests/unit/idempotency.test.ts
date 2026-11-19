import { afterEach, describe, expect, it, vi } from "vitest";
import { createIdempotencyKey } from "@/lib/api/idempotency";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("createIdempotencyKey", () => {
  it("uses crypto.randomUUID when available", () => {
    const randomUUID = vi.fn(() => "11111111-1111-4111-8111-111111111111");
    vi.stubGlobal("crypto", { randomUUID });

    expect(createIdempotencyKey()).toBe("11111111-1111-4111-8111-111111111111");
    expect(randomUUID).toHaveBeenCalledOnce();
  });

  it("builds a UUID v4 from getRandomValues without randomUUID", () => {
    vi.stubGlobal("crypto", {
      getRandomValues: (bytes: Uint8Array) => {
        bytes.fill(0xab);
        return bytes;
      },
    });

    expect(createIdempotencyKey()).toMatch(uuidPattern);
  });

  it("falls back when crypto is unavailable", () => {
    vi.stubGlobal("crypto", undefined);

    expect(createIdempotencyKey()).toMatch(/^key-\d+-[a-z0-9]+$/);
  });
});

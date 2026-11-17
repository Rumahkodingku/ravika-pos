import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/modules/auth/password";

describe("password", () => {
  it("hashes and verifies a password", async () => {
    const hash = await hashPassword("demo123");

    expect(hash).not.toContain("demo123");
    expect(await verifyPassword("demo123", hash)).toBe(true);
    expect(await verifyPassword("salah", hash)).toBe(false);
  });

  it("uses a different salt for each hash", async () => {
    const first = await hashPassword("demo123");
    const second = await hashPassword("demo123");

    expect(first).not.toBe(second);
    expect(await verifyPassword("demo123", first)).toBe(true);
    expect(await verifyPassword("demo123", second)).toBe(true);
  });

  it("rejects malformed hashes", async () => {
    expect(await verifyPassword("demo123", "plain")).toBe(false);
  });
});

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { DatabaseBundle } from "@/infrastructure/database/client";
import { login, resolveSession } from "@/modules/auth/auth.service";
import { hasPermission, requirePermission } from "@/modules/rbac/authorization";
import { createTestDatabase } from "../helpers/test-db";

let bundle: DatabaseBundle;

beforeEach(async () => {
  bundle = await createTestDatabase();
});

afterEach(() => {
  bundle.close();
});

async function contextFor(identity: string) {
  const result = await login(
    bundle.db,
    { identity, password: "demo123", remember: false },
    identity,
  );
  const resolution = await resolveSession(bundle.db, result.token);

  if (resolution.status !== "valid") {
    throw new Error("Expected valid session");
  }

  return resolution.context;
}

describe("rbac", () => {
  it("grants permissions by role", async () => {
    const owner = await contextFor("owner");
    const cashier = await contextFor("cashier");
    const kitchen = await contextFor("kitchen");

    expect(hasPermission(owner, "business.update")).toBe(true);
    expect(hasPermission(cashier, "business.view")).toBe(true);
    expect(hasPermission(cashier, "business.update")).toBe(false);
    expect(hasPermission(kitchen, "kds.update_status")).toBe(true);
    expect(hasPermission(kitchen, "business.view")).toBe(false);
  });

  it("throws 403 when permission is missing", async () => {
    const cashier = await contextFor("cashier");

    expect(() => requirePermission(cashier, "business.update")).toThrow(
      expect.objectContaining({ code: "AUTH_FORBIDDEN", status: 403 }),
    );
  });
});

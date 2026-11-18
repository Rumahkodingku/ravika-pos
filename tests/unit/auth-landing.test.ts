import { describe, expect, it } from "vitest";
import { landingPathForPermissions } from "@/features/auth/landing";

describe("landingPathForPermissions", () => {
  it("sends dashboard viewers to management", () => {
    expect(landingPathForPermissions(["dashboard.view"])).toBe("/app");
    expect(landingPathForPermissions(["dashboard.view", "payments.view"])).toBe(
      "/app",
    );
  });

  it("sends POS operators to the cashier", () => {
    expect(landingPathForPermissions(["orders.create"])).toBe("/app/pos");
  });

  it("sends payment-only operators to the cashier", () => {
    expect(landingPathForPermissions(["payments.view"])).toBe("/app/pos");
  });

  it("sends kitchen staff to KDS", () => {
    expect(landingPathForPermissions(["kds.view"])).toBe("/kds");
  });

  it("rejects users without an operational permission", () => {
    expect(landingPathForPermissions(["orders.view"])).toBe(
      "/login?error=forbidden",
    );
  });
});

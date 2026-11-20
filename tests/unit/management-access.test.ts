import { describe, expect, it } from "vitest";
import { hasManagementAccess } from "@/lib/navigation";
import {
  cashierPermissionCodes,
  kitchenPermissionCodes,
  ownerPermissionCodes,
} from "@/shared/permissions";

describe("hasManagementAccess", () => {
  it("includes owner permissions", () => {
    expect(hasManagementAccess(ownerPermissionCodes)).toBe(true);
  });

  it("excludes cashier and kitchen permissions", () => {
    expect(hasManagementAccess(cashierPermissionCodes)).toBe(false);
    expect(hasManagementAccess(kitchenPermissionCodes)).toBe(false);
  });
});

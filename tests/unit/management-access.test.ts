import { describe, expect, it } from "vitest";
import { hasManagementAccess } from "@/lib/navigation";
import {
  baristaPermissionCodes,
  cashierPermissionCodes,
  ownerPermissionCodes,
} from "@/shared/permissions";

describe("hasManagementAccess", () => {
  it("includes owner permissions", () => {
    expect(hasManagementAccess(ownerPermissionCodes)).toBe(true);
  });

  it("excludes cashier and barista permissions", () => {
    expect(hasManagementAccess(cashierPermissionCodes)).toBe(false);
    expect(hasManagementAccess(baristaPermissionCodes)).toBe(false);
  });
});

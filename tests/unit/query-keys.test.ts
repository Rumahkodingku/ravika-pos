import { describe, expect, it } from "vitest";
import { queryKeys } from "@/lib/api/keys";

describe("queryKeys", () => {
  it("builds stable top-level keys", () => {
    expect(queryKeys.business).toEqual(["business"]);
    expect(queryKeys.roles).toEqual(["roles"]);
    expect(queryKeys.roleOptions).toEqual(["roles", "options"]);
    expect(queryKeys.addOns).toEqual(["add-ons"]);
    expect(queryKeys.payableOrders).toEqual(["orders", "payable"]);
    expect(queryKeys.kds).toEqual(["kds"]);
  });

  it("includes filters in list keys", () => {
    const filters = { page: 2, search: "kopi" };

    expect(queryKeys.products(filters)).toEqual(["products", filters]);
    expect(queryKeys.orders(filters)).toEqual(["orders", filters]);
    expect(queryKeys.salesReport(filters)).toEqual([
      "reports",
      "sales",
      filters,
    ]);
  });

  it("scopes detail keys for prefix invalidation", () => {
    expect(queryKeys.product("product-1")).toEqual([
      "products",
      "detail",
      "product-1",
    ]);
    expect(queryKeys.orderHistory("order-1")).toEqual([
      "orders",
      "order-1",
      "history",
    ]);
    expect(queryKeys.publicOrder("token")).toEqual([
      "public",
      "order",
      "token",
    ]);
  });
});

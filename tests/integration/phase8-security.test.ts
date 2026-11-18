import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { DatabaseBundle } from "@/infrastructure/database/client";
import { listAddOns, updateAddOn } from "@/modules/catalog/catalog.service";
import {
  findIdempotentResponse,
  saveIdempotentResponse,
} from "@/modules/idempotency/idempotency.service";
import { getPublicMenu } from "@/modules/tables/table.service";
import { consumeRateLimit } from "@/shared/rate-limit";
import { createTestDatabase } from "../helpers/test-db";

let bundle: DatabaseBundle;
const businessId = "business-ravika";

beforeEach(async () => {
  bundle = await createTestDatabase();
});

afterEach(() => {
  bundle.close();
});

describe("phase 8 security checks", () => {
  it("does not expose internal fields in the public menu", async () => {
    const menu = await getPublicMenu(bundle.db, "demo-qr-token-table-1");
    const product = menu.products[0];

    expect(product).toBeTruthy();
    expect(product).not.toHaveProperty("businessId");
    expect(product).not.toHaveProperty("createdBy");
    expect(product).not.toHaveProperty("createdAt");
    expect(menu).not.toHaveProperty("users");
    expect(menu).not.toHaveProperty("orders");
  });

  it("rejects an invalid table token", async () => {
    await expect(
      getPublicMenu(bundle.db, "invalid-token"),
    ).rejects.toMatchObject({ code: "QR_TOKEN_INVALID" });
  });

  it("hides inactive add-ons from public menu relations", async () => {
    const addOn = (await listAddOns(bundle.db, businessId)).find(
      (item) => item.id === "addon-extra-shot",
    );

    expect(addOn).toBeTruthy();
    await updateAddOn(bundle.db, businessId, "addon-extra-shot", {
      isActive: false,
      name: addOn?.name ?? "Extra Shot",
      price: addOn?.price ?? 5000,
    });

    const menu = await getPublicMenu(bundle.db, "demo-qr-token-table-1");
    const espresso = menu.products.find(
      (product) => product.id === "product-espresso",
    );

    expect(menu.addOns.some((item) => item.id === "addon-extra-shot")).toBe(
      false,
    );
    expect(
      espresso?.addOns.some(
        (relation) => relation.addOnId === "addon-extra-shot",
      ),
    ).toBe(false);
  });

  it("rejects idempotency key reuse with a different hash", async () => {
    await saveIdempotentResponse(bundle.db, {
      body: { id: "order-1" },
      businessId,
      hash: "hash-a",
      key: "phase8-idempotency",
      operation: "CREATE_ORDER",
      resourceId: "order-1",
      resourceType: "order",
      status: 201,
    });

    await expect(
      findIdempotentResponse(bundle.db, {
        businessId,
        hash: "hash-b",
        key: "phase8-idempotency",
        operation: "CREATE_ORDER",
      }),
    ).rejects.toMatchObject({ code: "IDEMPOTENCY_KEY_REUSED" });
  });

  it("enforces the public rate limit", () => {
    const key = `phase8-rate-${Date.now()}`;

    expect(consumeRateLimit(key, 2, 60_000)).toBe(true);
    expect(consumeRateLimit(key, 2, 60_000)).toBe(true);
    expect(consumeRateLimit(key, 2, 60_000)).toBe(false);
  });
});

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { DatabaseBundle } from "@/infrastructure/database/client";
import {
  createAddOn,
  createProduct,
  updateAddOn,
} from "@/modules/catalog/catalog.service";
import { createTestDatabase } from "../helpers/test-db";

let bundle: DatabaseBundle;
const businessId = "business-ravika";

beforeEach(async () => {
  bundle = await createTestDatabase();
});

afterEach(() => {
  bundle.close();
});

describe("add-ons", () => {
  it("creates, updates, and deactivates an add-on", async () => {
    const addOn = await createAddOn(bundle.db, businessId, {
      name: "Caramel",
      price: 4000,
      isActive: true,
    });

    expect(addOn.name).toBe("Caramel");
    expect(addOn.price).toBe(4000);

    const updated = await updateAddOn(bundle.db, businessId, addOn.id, {
      name: "Caramel Syrup",
      price: 4500,
      isActive: false,
    });

    expect(updated.name).toBe("Caramel Syrup");
    expect(updated.price).toBe(4500);
    expect(updated.isActive).toBe(false);

    await expect(
      createAddOn(bundle.db, businessId, {
        name: "caramel syrup",
        price: 1000,
        isActive: true,
      }),
    ).rejects.toMatchObject({ code: "ADDON_NAME_CONFLICT" });
  });

  it("rejects inactive add-ons in product relations", async () => {
    const addOn = await createAddOn(bundle.db, businessId, {
      name: "Inactive Topping",
      price: 1000,
      isActive: false,
    });

    await expect(
      createProduct(bundle.db, businessId, {
        name: "Produk Test",
        description: "",
        categoryId: "category-kopi",
        basePrice: 10000,
        isAvailable: true,
        isActive: true,
        variants: [],
        addOns: [
          {
            addOnId: addOn.id,
            isRequired: false,
            minSelection: 0,
            maxSelection: 1,
          },
        ],
      }),
    ).rejects.toMatchObject({ code: "VALIDATION_FAILED" });
  });
});

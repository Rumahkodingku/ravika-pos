import { describe, expect, it } from "vitest";
import { productSchema } from "@/modules/catalog/catalog.schemas";

const base = {
  addOns: [],
  categoryId: "category-kopi",
  description: "",
  isActive: true,
  isAvailable: true,
  name: "Nasi Goreng",
};

describe("productSchema pricing", () => {
  it("requires base price for a product without variants", () => {
    expect(
      productSchema.safeParse({ ...base, basePrice: null, variants: [] })
        .success,
    ).toBe(false);
  });

  it("accepts base price for a product without variants", () => {
    const parsed = productSchema.parse({
      ...base,
      basePrice: 5_000,
      variants: [],
    });

    expect(parsed.basePrice).toBe(5_000);
  });

  it("accepts full variant prices and a null base price", () => {
    const parsed = productSchema.parse({
      ...base,
      basePrice: null,
      variants: [
        { isActive: true, name: "Regular", price: 15_000 },
        { isActive: true, name: "Jumbo", price: 20_000 },
      ],
    });

    expect(parsed.basePrice).toBeNull();
    expect(parsed.variants.map((variant) => variant.price)).toEqual([
      15_000, 20_000,
    ]);
  });

  it("normalizes an omitted base price to null for a product with variants", () => {
    const parsed = productSchema.parse({
      ...base,
      variants: [{ isActive: true, name: "Regular", price: 15_000 }],
    });

    expect(parsed.basePrice).toBeNull();
  });

  it("rejects a numeric base price for a product with variants", () => {
    expect(
      productSchema.safeParse({
        ...base,
        basePrice: 15_000,
        variants: [{ isActive: true, name: "Regular", price: 15_000 }],
      }).success,
    ).toBe(false);
  });

  it("requires a price for every variant", () => {
    expect(
      productSchema.safeParse({
        ...base,
        basePrice: null,
        variants: [{ isActive: true, name: "Regular" }],
      }).success,
    ).toBe(false);
  });

  it("rejects priceAdjustment", () => {
    expect(
      productSchema.safeParse({
        ...base,
        basePrice: 15_000,
        variants: [{ isActive: true, name: "Regular", priceAdjustment: 5_000 }],
      }).success,
    ).toBe(false);
  });

  it("rejects negative and decimal variant prices", () => {
    expect(
      productSchema.safeParse({
        ...base,
        basePrice: null,
        variants: [{ isActive: true, name: "Regular", price: -1 }],
      }).success,
    ).toBe(false);
    expect(
      productSchema.safeParse({
        ...base,
        basePrice: null,
        variants: [{ isActive: true, name: "Regular", price: 15_000.5 }],
      }).success,
    ).toBe(false);
  });
});

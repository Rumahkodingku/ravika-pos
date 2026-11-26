import { describe, expect, it } from "vitest";
import {
  hasActiveVariants,
  isProductSellable,
  minimumActiveVariantPrice,
  productPriceDisplay,
  resolveProductUnitPrice,
} from "@/lib/catalog-pricing";

const product = {
  basePrice: 15_000,
  isActive: true,
  isAvailable: true,
  variants: [
    { isActive: true, price: 15_000 },
    { isActive: true, price: 20_000 },
  ],
};

describe("catalog pricing", () => {
  it("uses base price when the product has no variants", () => {
    expect(
      resolveProductUnitPrice({ basePrice: 5_000, variants: [] }, null),
    ).toBe(5_000);
  });

  it("uses the selected variant price", () => {
    expect(resolveProductUnitPrice(product, product.variants[1])).toBe(20_000);
  });

  it("does not add base price to the variant price", () => {
    expect(
      resolveProductUnitPrice(
        { basePrice: 15_000, variants: [{ isActive: true, price: 20_000 }] },
        { isActive: true, price: 20_000 },
      ),
    ).toBe(20_000);
  });

  it("rejects a product with variants when no variant is selected", () => {
    expect(resolveProductUnitPrice(product, null)).toBeNull();
  });

  it("rejects an inactive variant", () => {
    expect(
      resolveProductUnitPrice(
        { basePrice: 15_000, variants: [{ isActive: false, price: 20_000 }] },
        { isActive: false, price: 20_000 },
      ),
    ).toBeNull();
  });

  it("rejects a product without variants and without base price", () => {
    expect(
      resolveProductUnitPrice({ basePrice: null, variants: [] }, null),
    ).toBeNull();
  });

  it("reports whether active variants exist", () => {
    expect(
      hasActiveVariants({ variants: [{ isActive: false, price: 1 }] }),
    ).toBe(false);
    expect(
      hasActiveVariants({ variants: [{ isActive: true, price: 1 }] }),
    ).toBe(true);
  });

  it("takes the minimum price from active variants only", () => {
    expect(
      minimumActiveVariantPrice({
        variants: [
          { isActive: false, price: 5_000 },
          { isActive: true, price: 18_000 },
          { isActive: true, price: 16_000 },
        ],
      }),
    ).toBe(16_000);
  });

  it("shows a fixed price for a product without variants", () => {
    expect(productPriceDisplay({ basePrice: 5_000, variants: [] })).toEqual({
      amount: 5_000,
      kind: "fixed",
    });
  });

  it("shows a fixed price for a single active variant", () => {
    expect(
      productPriceDisplay({
        basePrice: null,
        variants: [{ isActive: true, price: 18_000 }],
      }),
    ).toEqual({ amount: 18_000, kind: "fixed" });
  });

  it("shows a starting price for multiple active variants", () => {
    expect(productPriceDisplay(product)).toEqual({
      amount: 15_000,
      kind: "from",
    });
  });

  it("shows unavailable when no variant is active", () => {
    expect(
      productPriceDisplay({
        basePrice: null,
        variants: [{ isActive: false, price: 18_000 }],
      }),
    ).toEqual({ kind: "unavailable" });
  });

  it("does not sell a product without an active variant", () => {
    expect(
      isProductSellable({
        ...product,
        variants: [{ isActive: false, price: 18_000 }],
      }),
    ).toBe(false);
  });

  it("does not sell a product without a configured base price", () => {
    expect(
      isProductSellable({
        basePrice: null,
        isActive: true,
        isAvailable: true,
        variants: [],
      }),
    ).toBe(false);
  });
});

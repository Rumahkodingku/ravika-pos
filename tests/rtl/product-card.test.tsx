/** @vitest-environment jsdom */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProductCard } from "@/components/ui/product-card";
import type { Product } from "@/types/domain";

const baseProduct: Product = {
  addOns: [],
  basePrice: 5000,
  businessId: "business-ravika",
  categoryId: "category-teh",
  createdAt: "2026-11-15T08:00:00.000Z",
  description: "",
  id: "product-es-teh",
  imageUrl: null,
  isActive: true,
  isAvailable: true,
  name: "Es Teh",
  updatedAt: "2026-11-15T08:00:00.000Z",
  variants: [],
};

describe("ProductCard pricing", () => {
  it("shows the base price for a product without variants", () => {
    render(<ProductCard onAdd={() => undefined} product={baseProduct} />);

    expect(screen.getByText(/Rp\s?5\.000/)).toBeDefined();
    expect(screen.getByRole("button", { name: "Tambah Es Teh" })).toBeDefined();
  });

  it("shows the minimum active variant price", () => {
    render(
      <ProductCard
        onAdd={() => undefined}
        product={{
          ...baseProduct,
          basePrice: null,
          variants: [
            { id: "variant-1", isActive: true, name: "Regular", price: 15000 },
            { id: "variant-2", isActive: true, name: "Jumbo", price: 20000 },
          ],
        }}
      />,
    );

    expect(screen.getByText(/Mulai dari Rp\s?15\.000/)).toBeDefined();
  });

  it("disables a product without active variants", () => {
    render(
      <ProductCard
        onAdd={() => undefined}
        product={{
          ...baseProduct,
          basePrice: null,
          variants: [
            { id: "variant-1", isActive: false, name: "Regular", price: 15000 },
          ],
        }}
      />,
    );

    expect(screen.getAllByText("Tidak tersedia").length).toBeGreaterThan(0);

    const button = screen.getByRole("button", {
      name: /tidak tersedia/i,
    }) as HTMLButtonElement;

    expect(button.disabled).toBe(true);
  });
});

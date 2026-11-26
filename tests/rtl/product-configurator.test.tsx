/** @vitest-environment jsdom */

import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import {
  ProductConfigurator,
  type ProductConfiguratorResult,
} from "@/features/operational/product-configurator";
import type { AddOn, Product } from "@/types/domain";
import { renderWithProviders } from "../helpers/render";

const addOns: AddOn[] = [
  {
    id: "addon-egg",
    businessId: "business-ravika",
    isActive: true,
    name: "Telur",
    price: 5000,
  },
];

const product: Product = {
  addOns: [
    {
      addOnId: "addon-egg",
      isRequired: false,
      maxSelection: 1,
      minSelection: 0,
    },
  ],
  basePrice: null,
  businessId: "business-ravika",
  categoryId: "category-makanan",
  createdAt: "2026-11-15T08:00:00.000Z",
  description: "",
  id: "product-nasi-goreng",
  imageUrl: null,
  isActive: true,
  isAvailable: true,
  name: "Nasi Goreng",
  updatedAt: "2026-11-15T08:00:00.000Z",
  variants: [
    { id: "variant-regular", isActive: true, name: "Regular", price: 15000 },
    { id: "variant-jumbo", isActive: true, name: "Jumbo", price: 20000 },
  ],
};

function unitPrice(text: string | RegExp) {
  const box = screen.getByText("Harga satuan").parentElement?.parentElement;

  if (!box) {
    throw new Error("unit price box not found");
  }

  return within(box).getByText(text);
}

function totalPrice(text: string | RegExp) {
  const box = screen.getByText("Total").parentElement;

  if (!box) {
    throw new Error("total price box not found");
  }

  return within(box).getByText(text);
}

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close() {
    this.open = false;
    this.dispatchEvent(new Event("close"));
  };
});

describe("ProductConfigurator variant pricing", () => {
  it("uses the full variant price and keeps add-ons additive", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn<(input: ProductConfiguratorResult) => void>();

    renderWithProviders(
      <ProductConfigurator
        addOns={addOns}
        onOpenChange={vi.fn()}
        onSubmit={onSubmit}
        open
        product={product}
      />,
    );

    expect(unitPrice(/Rp\s?15\.000/)).toBeDefined();

    await user.selectOptions(screen.getByLabelText(/^Varian/), "variant-jumbo");

    expect(unitPrice(/Rp\s?20\.000/)).toBeDefined();

    await user.click(screen.getByRole("checkbox"));

    expect(unitPrice(/Rp\s?25\.000/)).toBeDefined();
    expect(totalPrice(/Rp\s?25\.000/)).toBeDefined();

    await user.click(screen.getByRole("button", { name: "Tambah kuantitas" }));

    expect(unitPrice(/Rp\s?25\.000/)).toBeDefined();
    expect(totalPrice(/Rp\s?50\.000/)).toBeDefined();

    await user.click(screen.getByRole("button", { name: "Tambahkan" }));

    expect(onSubmit).toHaveBeenCalledWith({
      addOnIds: ["addon-egg"],
      notes: "",
      productId: "product-nasi-goreng",
      quantity: 2,
      variantId: "variant-jumbo",
    });
  });

  it("blocks submit when every variant is inactive", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    renderWithProviders(
      <ProductConfigurator
        addOns={[]}
        onOpenChange={vi.fn()}
        onSubmit={onSubmit}
        open
        product={{
          ...product,
          addOns: [],
          variants: product.variants.map((variant) => ({
            ...variant,
            isActive: false,
          })),
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Tambahkan" }));

    expect(screen.getByText("Tidak ada varian yang tersedia.")).toBeDefined();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

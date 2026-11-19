/** @vitest-environment jsdom */

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import CategoriesPage from "@/app/(dashboard)/app/categories/page";
import ProductsPage from "@/app/(dashboard)/app/products/page";
import type { SessionUser } from "@/types/auth";
import type { AddOn, Category, Product } from "@/types/domain";
import { renderWithProviders } from "../helpers/render";

vi.mock("@/lib/image", () => ({
  PRODUCT_IMAGE_ACCEPT: "image/jpeg,image/png,image/webp",
  compressProductImage: vi.fn(
    async () => new Blob([new Uint8Array([1, 2, 3])], { type: "image/webp" }),
  ),
}));

const fetchMock = vi.fn();

const owner: SessionUser = {
  id: "user-owner",
  name: "Rina Pemilik",
  email: "owner@ravika.id",
  username: "owner",
  role: "OWNER",
  roleLabel: "Pemilik",
  permissions: [
    "categories.view",
    "categories.manage",
    "products.view",
    "products.manage",
  ],
};

const category: Category = {
  id: "category-kopi",
  businessId: "business-ravika",
  name: "Kopi",
  description: "Minuman kopi.",
  sortOrder: 0,
  isActive: true,
  createdAt: "2026-11-15T08:00:00.000Z",
  updatedAt: "2026-11-15T08:00:00.000Z",
};

const espresso: Product = {
  id: "product-espresso",
  businessId: "business-ravika",
  categoryId: "category-kopi",
  name: "Espresso",
  description: "",
  imageUrl: null,
  basePrice: 22000,
  isAvailable: true,
  isActive: true,
  variants: [
    {
      id: "variant-espresso-large",
      name: "Large",
      priceAdjustment: 5000,
      isActive: true,
    },
  ],
  addOns: [
    {
      addOnId: "addon-extra-shot",
      isRequired: false,
      minSelection: 0,
      maxSelection: 2,
    },
  ],
  createdAt: "2026-11-15T08:00:00.000Z",
  updatedAt: "2026-11-15T08:00:00.000Z",
};

const addOns: AddOn[] = [
  {
    id: "addon-extra-shot",
    businessId: "business-ravika",
    name: "Extra Shot",
    price: 5000,
    isActive: true,
  },
];

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status,
  });
}

function pageOf<T>(items: T[]) {
  return {
    items,
    page: 1,
    pageCount: 1,
    pageSize: 10,
    total: items.length,
  };
}

function mockApi(
  overrides: (url: string, init?: RequestInit) => Response | null = () => null,
) {
  fetchMock.mockImplementation(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const override = overrides(url, init);

      if (override) {
        return override;
      }

      if (url.startsWith("/api/categories?")) {
        return jsonResponse(pageOf([category]));
      }

      if (url.startsWith("/api/products?")) {
        return jsonResponse(pageOf([espresso]));
      }

      if (url === "/api/add-ons") {
        return jsonResponse(addOns);
      }

      return jsonResponse({}, 404);
    },
  );
}

beforeAll(() => {
  URL.createObjectURL = vi.fn(() => "blob:preview");
  URL.revokeObjectURL = vi.fn();
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close() {
    this.open = false;
    this.dispatchEvent(new Event("close"));
  };
});

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CategoriesPage", () => {
  it("moves a category through the move endpoint", async () => {
    const user = userEvent.setup();
    mockApi((url, init) =>
      url === "/api/categories/category-kopi/move" && init?.method === "POST"
        ? jsonResponse(pageOf([category]))
        : null,
    );
    renderWithProviders(<CategoriesPage />, { user: owner });

    const moveButtons = await screen.findAllByRole("button", {
      name: "Naikkan Kopi",
    });
    await user.click(moveButtons[0]);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/categories/category-kopi/move",
        expect.objectContaining({ method: "POST" }),
      );
    });

    const call = fetchMock.mock.calls.find(
      ([url, init]) =>
        url === "/api/categories/category-kopi/move" && init?.method === "POST",
    );

    expect(JSON.parse((call?.[1] as RequestInit).body as string)).toEqual({
      direction: "up",
    });
  });
});

describe("ProductsPage", () => {
  it("posts variants and add-on relations exactly once on create", async () => {
    const user = userEvent.setup();
    mockApi((url, init) =>
      url === "/api/products" && init?.method === "POST"
        ? jsonResponse({ ...espresso, id: "product-new" }, 201)
        : null,
    );
    renderWithProviders(<ProductsPage />, { user: owner });

    await screen.findAllByText("Espresso");
    await user.click(
      await screen.findByRole("button", { name: "Tambah produk" }),
    );
    await user.type(screen.getByLabelText(/^Nama produk/), "Kopi Susu");
    await user.selectOptions(
      screen.getByLabelText(/^Kategori/),
      "category-kopi",
    );
    await user.clear(screen.getByLabelText(/^Harga dasar/));
    await user.type(screen.getByLabelText(/^Harga dasar/), "24000");

    await user.click(screen.getByRole("button", { name: "Varian" }));
    await user.type(screen.getByLabelText(/^Nama varian/), "Large");
    await user.type(screen.getByLabelText(/^Tambahan harga/), "5000");

    await user.click(screen.getByRole("button", { name: "Add-on" }));
    await user.selectOptions(
      screen.getByLabelText(/^Add-on$/),
      "addon-extra-shot",
    );

    await user.click(screen.getByRole("button", { name: "Simpan" }));

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.filter(
          ([url, init]) => url === "/api/products" && init?.method === "POST",
        ),
      ).toHaveLength(1);
    });

    const call = fetchMock.mock.calls.find(
      ([url, init]) => url === "/api/products" && init?.method === "POST",
    );
    const body = JSON.parse((call?.[1] as RequestInit).body as string);

    expect(body).toMatchObject({
      basePrice: 24000,
      categoryId: "category-kopi",
      name: "Kopi Susu",
    });
    expect(body.variants).toHaveLength(1);
    expect(body.variants[0]).toMatchObject({
      name: "Large",
      priceAdjustment: 5000,
    });
    expect(body.addOns).toEqual([
      {
        addOnId: "addon-extra-shot",
        isRequired: false,
        minSelection: 0,
        maxSelection: 1,
      },
    ]);
  });

  it("fetches detail then patches the full product when toggling flags", async () => {
    const user = userEvent.setup();
    mockApi((url, init) => {
      if (url === "/api/products/product-espresso" && !init?.method) {
        return jsonResponse(espresso);
      }

      if (
        url === "/api/products/product-espresso" &&
        init?.method === "PATCH"
      ) {
        return jsonResponse({ ...espresso, isAvailable: false });
      }

      return null;
    });
    renderWithProviders(<ProductsPage />, { user: owner });

    const toggleButtons = await screen.findAllByRole("button", {
      name: "Tandai Espresso habis",
    });
    await user.click(toggleButtons[0]);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/products/product-espresso",
        expect.objectContaining({ method: "PATCH" }),
      );
    });

    const getIndex = fetchMock.mock.calls.findIndex(
      ([url, init]) =>
        url === "/api/products/product-espresso" && init?.method === undefined,
    );
    const patchIndex = fetchMock.mock.calls.findIndex(
      ([url, init]) =>
        url === "/api/products/product-espresso" && init?.method === "PATCH",
    );

    expect(getIndex).toBeGreaterThan(-1);
    expect(patchIndex).toBeGreaterThan(getIndex);

    const body = JSON.parse(
      (fetchMock.mock.calls[patchIndex][1] as RequestInit).body as string,
    );

    expect(body).toEqual({
      addOns: [
        {
          addOnId: "addon-extra-shot",
          isRequired: false,
          maxSelection: 2,
          minSelection: 0,
        },
      ],
      basePrice: 22000,
      categoryId: "category-kopi",
      description: "",
      isActive: true,
      isAvailable: false,
      name: "Espresso",
      variants: [
        {
          id: "variant-espresso-large",
          isActive: true,
          name: "Large",
          priceAdjustment: 5000,
        },
      ],
    });
    expect(body).not.toHaveProperty("businessId");
    expect(body).not.toHaveProperty("createdAt");
    expect(body).not.toHaveProperty("updatedAt");
  });
  it("uploads a compressed image after creating the product", async () => {
    const user = userEvent.setup();
    mockApi((url, init) => {
      if (url === "/api/products" && init?.method === "POST") {
        return jsonResponse({ ...espresso, id: "product-new" }, 201);
      }
      if (url === "/api/products/product-new/image" && init?.method === "PUT") {
        return jsonResponse({
          imageUrl: "/api/product-images/product-new?v=1",
        });
      }
      return null;
    });
    renderWithProviders(<ProductsPage />, { user: owner });

    await screen.findAllByText("Espresso");
    await user.click(
      await screen.findByRole("button", { name: "Tambah produk" }),
    );
    await user.type(screen.getByLabelText(/^Nama produk/), "Kopi Susu");
    await user.selectOptions(
      screen.getByLabelText(/^Kategori/),
      "category-kopi",
    );
    await user.upload(
      screen.getByLabelText("Pilih gambar"),
      new File([new Uint8Array([1, 2, 3])], "latte.png", {
        type: "image/png",
      }),
    );
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.filter(
          ([url, init]) =>
            url === "/api/products/product-new/image" && init?.method === "PUT",
        ),
      ).toHaveLength(1);
    });

    const call = fetchMock.mock.calls.find(
      ([url, init]) =>
        url === "/api/products/product-new/image" && init?.method === "PUT",
    );
    const body = (call?.[1] as RequestInit).body as FormData;

    expect(body).toBeInstanceOf(FormData);
    expect(body.get("image")).toBeInstanceOf(Blob);
    expect((body.get("image") as Blob).type).toBe("image/webp");
  });
});

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
import MenuPage from "@/app/(customer)/menu/[token]/page";
import { renderWithProviders } from "../helpers/render";

vi.mock("next/navigation", () => ({
  useParams: () => ({ token: "token-meja" }),
}));

const fetchMock = vi.fn();

const menu = {
  business: { name: "Ravika Coffee", address: "Jl. Merdeka 1" },
  table: { id: "table-3", name: "Meja 03" },
  categories: [{ id: "category-kopi", name: "Kopi" }],
  products: [
    {
      id: "product-kopi-susu",
      categoryId: "category-kopi",
      name: "Kopi Susu",
      description: "Espresso dan susu",
      basePrice: 25000,
      variants: [],
      addOns: [
        {
          addOnId: "addon-extra-shot",
          isRequired: true,
          minSelection: 1,
          maxSelection: 1,
        },
      ],
    },
  ],
  addOns: [
    {
      id: "addon-extra-shot",
      businessId: "business-1",
      name: "Extra Shot",
      price: 5000,
      isActive: true,
    },
  ],
};

const createdOrder = {
  orderNumber: "RVK-900",
  publicToken: "public-900",
  grandTotal: 30000,
  tableName: "Meja 03",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status,
  });
}

function orderPosts() {
  return fetchMock.mock.calls.filter(
    ([url, init]) =>
      String(url) === "/api/public/orders" && init?.method === "POST",
  );
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

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockImplementation(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url === "/api/public/menu/token-meja" && !init?.method) {
        return jsonResponse(menu);
      }

      if (url === "/api/public/orders" && init?.method === "POST") {
        return jsonResponse(createdOrder, 201);
      }

      return jsonResponse({}, 404);
    },
  );
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("customer menu", () => {
  it("renders API add-ons and submits a public order with an idempotency key", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MenuPage />);

    expect(await screen.findByText("Ravika Coffee, Meja 03")).toBeDefined();

    await user.click(screen.getByRole("button", { name: "Tambah Kopi Susu" }));

    const addOnLabel = (await screen.findByText("Extra Shot")).closest("label");
    expect(addOnLabel?.textContent).toContain("5.000");
    expect(screen.getByText("Wajib")).toBeDefined();

    await user.click(screen.getByRole("checkbox"));
    await user.click(
      screen.getByRole("button", { name: "Tambah ke keranjang" }),
    );

    await user.click(screen.getByRole("button", { name: "Lihat keranjang" }));
    await user.click(screen.getByRole("button", { name: "Kirim pesanan" }));

    await waitFor(() => expect(orderPosts()).toHaveLength(1));

    const [call] = orderPosts();
    const body = JSON.parse((call[1] as RequestInit).body as string);

    expect(body).toMatchObject({
      tableToken: "token-meja",
      notes: "",
      items: [
        {
          productId: "product-kopi-susu",
          variantId: null,
          addOnIds: ["addon-extra-shot"],
          quantity: 1,
          notes: "",
        },
      ],
    });
    expect(
      new Headers((call[1] as RequestInit).headers).get("Idempotency-Key"),
    ).toBeTruthy();
    expect(await screen.findByText("RVK-900")).toBeDefined();
  });

  it("renders an invalid QR state for an unknown token", async () => {
    fetchMock.mockImplementation(async () =>
      jsonResponse(
        { code: "QR_TOKEN_INVALID", detail: "Token QR tidak valid." },
        404,
      ),
    );

    renderWithProviders(<MenuPage />);

    expect(await screen.findByText("QR tidak valid")).toBeDefined();
    expect(screen.queryByText("Data contoh")).toBeNull();
  });
});

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
        const body = JSON.parse(String(init.body));

        return jsonResponse(
          {
            ...createdOrder,
            cashTendered: body.cashTendered ?? null,
            grandTotal: 30000,
          },
          201,
        );
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
    await user.click(screen.getByRole("radio", { name: "Bayar di kasir" }));
    await user.click(screen.getByRole("button", { name: "Kirim pesanan" }));

    await waitFor(() => expect(orderPosts()).toHaveLength(1));

    const [call] = orderPosts();
    const body = JSON.parse((call[1] as RequestInit).body as string);

    expect(body).toMatchObject({
      tableToken: "token-meja",
      notes: "",
      cashTendered: null,
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

  it("uses the selected variant price in the public cart and payload", async () => {
    const user = userEvent.setup();
    const original = fetchMock.getMockImplementation();

    if (!original) {
      throw new Error("missing fetch mock");
    }

    fetchMock.mockImplementation(async (input, init) => {
      const url = String(input);

      if (url === "/api/public/menu/token-meja" && !init?.method) {
        return jsonResponse({
          ...menu,
          addOns: [],
          products: [
            {
              ...menu.products[0],
              addOns: [],
              basePrice: null,
              id: "product-nasi-goreng",
              name: "Nasi Goreng",
              variants: [
                {
                  id: "variant-regular",
                  isActive: true,
                  name: "Regular",
                  price: 15000,
                },
                {
                  id: "variant-jumbo",
                  isActive: true,
                  name: "Jumbo",
                  price: 20000,
                },
              ],
            },
          ],
        });
      }

      return original(input, init);
    });

    renderWithProviders(<MenuPage />);

    await user.click(
      await screen.findByRole("button", { name: "Tambah Nasi Goreng" }),
    );
    await user.selectOptions(screen.getByLabelText(/^Varian/), "variant-jumbo");
    await user.click(
      screen.getByRole("button", { name: "Tambah ke keranjang" }),
    );
    await user.click(screen.getByRole("button", { name: "Lihat keranjang" }));

    expect(screen.getAllByText(/Rp\s?20\.000/).length).toBeGreaterThan(0);

    await user.click(screen.getByRole("radio", { name: "Bayar di kasir" }));
    await user.click(screen.getByRole("button", { name: "Kirim pesanan" }));

    await waitFor(() => expect(orderPosts()).toHaveLength(1));

    const [call] = orderPosts();
    const body = JSON.parse((call[1] as RequestInit).body as string);

    expect(body.items[0]).toMatchObject({
      addOnIds: [],
      productId: "product-nasi-goreng",
      quantity: 1,
      variantId: "variant-jumbo",
    });
  });

  it("shows change and submits declared cash", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MenuPage />);

    await user.click(
      await screen.findByRole("button", { name: "Tambah Kopi Susu" }),
    );
    await user.click(await screen.findByRole("checkbox"));
    await user.click(
      screen.getByRole("button", { name: "Tambah ke keranjang" }),
    );
    await user.click(screen.getByRole("button", { name: "Lihat keranjang" }));
    await user.click(
      screen.getByRole("radio", { name: "Tunai, siapkan kembalian" }),
    );
    await user.type(screen.getByLabelText("Uang tunai"), "35000");

    expect(screen.getByText("Kembalian")).toBeDefined();
    expect(screen.getByText("Kembalian").parentElement?.textContent).toContain(
      "5.000",
    );

    await user.click(screen.getByRole("button", { name: "Kirim pesanan" }));

    await waitFor(() => expect(orderPosts()).toHaveLength(1));

    const [call] = orderPosts();
    const body = JSON.parse((call[1] as RequestInit).body as string);

    expect(body.cashTendered).toBe(35000);
    expect(await screen.findByText(/kembalian Rp\s5\.000/i)).toBeDefined();
  });

  it("blocks cash below the total", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MenuPage />);

    await user.click(
      await screen.findByRole("button", { name: "Tambah Kopi Susu" }),
    );
    await user.click(await screen.findByRole("checkbox"));
    await user.click(
      screen.getByRole("button", { name: "Tambah ke keranjang" }),
    );
    await user.click(screen.getByRole("button", { name: "Lihat keranjang" }));
    await user.click(
      screen.getByRole("radio", { name: "Tunai, siapkan kembalian" }),
    );
    await user.type(screen.getByLabelText("Uang tunai"), "25000");

    expect(
      (
        screen.getByRole("button", {
          name: "Kirim pesanan",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    expect(screen.getByText(/Nominal kurang/)).toBeDefined();
    expect(orderPosts()).toHaveLength(0);
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

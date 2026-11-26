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
import { PosCartProvider } from "@/components/shells/pos-cart-context";
import { PosCheckoutDrawer } from "@/features/operational/pos-checkout-drawer";
import { PosPayableOrderDrawer } from "@/features/operational/pos-payable-order-drawer";
import { PosPaymentDrawer } from "@/features/operational/pos-payment-drawer";
import type { Order, Product } from "@/types/domain";
import { renderWithProviders } from "../helpers/render";

const fetchMock = vi.fn();
const cartKey = "ravika-pos-cart";

const croissant: Product = {
  id: "product-croissant",
  businessId: "business-ravika",
  categoryId: "category-makanan",
  name: "Croissant",
  description: "",
  imageUrl: null,
  basePrice: 28000,
  isAvailable: true,
  isActive: true,
  variants: [],
  addOns: [],
  createdAt: "2026-11-15T08:00:00.000Z",
  updatedAt: "2026-11-15T08:00:00.000Z",
};

const variantProduct: Product = {
  ...croissant,
  basePrice: null,
  id: "product-nasi-goreng",
  name: "Nasi Goreng",
  variants: [
    {
      id: "variant-jumbo",
      isActive: true,
      name: "Jumbo",
      price: 20000,
    },
  ],
};

const order: Order = {
  id: "order-1",
  businessId: "business-ravika",
  orderNumber: "RVK-2100",
  orderType: "TAKEAWAY",
  source: "CASHIER",
  tableId: null,
  tableName: null,
  createdByName: "Bagas Kasir",
  orderStatus: "NEW",
  paymentStatus: "UNPAID",
  publicToken: null,
  subtotal: 28000,
  grandTotal: 28000,
  cashTendered: null,
  notes: "",
  createdBy: "user-cashier",
  createdAt: "2026-11-15T08:00:00.000Z",
  updatedAt: "2026-11-15T08:00:00.000Z",
  items: [],
};

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
    pageSize: 100,
    total: items.length,
  };
}

function seedCart() {
  window.sessionStorage.setItem(
    cartKey,
    JSON.stringify({
      orderType: "TAKEAWAY",
      tableId: null,
      orderNotes: "Pedas",
      items: [
        {
          key: "line-1",
          productId: "product-croissant",
          variantId: null,
          addOnIds: [],
          quantity: 2,
          notes: "",
        },
      ],
    }),
  );
}

function postCalls() {
  return fetchMock.mock.calls.filter(
    ([url, init]) => String(url) === "/api/orders" && init?.method === "POST",
  );
}

function paymentPosts() {
  return fetchMock.mock.calls.filter(
    ([url, init]) =>
      String(url) === "/api/orders/order-1/payments" && init?.method === "POST",
  );
}

function idempotencyKey(call: unknown[]) {
  return new Headers((call[1] as RequestInit).headers).get("Idempotency-Key");
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
  window.sessionStorage.clear();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("POS checkout", () => {
  it("posts cart lines with a stable idempotency key across network retries", async () => {
    const user = userEvent.setup();
    const onCreated = vi.fn();
    let attempts = 0;
    fetchMock.mockImplementation(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);

        if (url === "/api/orders" && init?.method === "POST") {
          attempts += 1;
          if (attempts === 1) {
            throw new TypeError("Failed to fetch");
          }
          return jsonResponse(order, 201);
        }

        return mockCatalogResponse(url, init);
      },
    );
    seedCart();

    renderWithProviders(
      <PosCartProvider>
        <PosCheckoutDrawer onCreated={onCreated} onOpenChange={vi.fn()} open />
      </PosCartProvider>,
    );

    await screen.findByText("2 x Croissant");
    const submit = screen.getByRole("button", {
      name: "Konfirmasi pesanan",
    });

    await user.click(submit);
    await screen.findByText(/Tidak dapat terhubung/);
    await user.click(submit);

    await waitFor(() => expect(postCalls()).toHaveLength(2));

    const [first, second] = postCalls();
    const body = JSON.parse((first[1] as RequestInit).body as string);

    expect(body).toEqual({
      orderType: "TAKEAWAY",
      tableId: null,
      notes: "Pedas",
      items: [
        {
          productId: "product-croissant",
          variantId: null,
          addOnIds: [],
          quantity: 2,
          notes: "",
        },
      ],
    });
    expect(idempotencyKey(first)).toBeTruthy();
    expect(idempotencyKey(second)).toBe(idempotencyKey(first));
    expect(onCreated).toHaveBeenCalledWith(order);
    expect(await screen.findByText("Pesanan dibuat")).toBeDefined();
  });

  it("uses the selected variant price in the cart total", async () => {
    fetchMock.mockImplementation(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);

        if (url.startsWith("/api/products?")) {
          return jsonResponse(pageOf([variantProduct]));
        }

        return mockCatalogResponse(url, init);
      },
    );
    window.sessionStorage.setItem(
      cartKey,
      JSON.stringify({
        items: [
          {
            addOnIds: [],
            key: "line-variant",
            notes: "",
            productId: "product-nasi-goreng",
            quantity: 2,
            variantId: "variant-jumbo",
          },
        ],
        orderNotes: "",
        orderType: "TAKEAWAY",
        tableId: null,
      }),
    );

    renderWithProviders(
      <PosCartProvider>
        <PosCheckoutDrawer onCreated={vi.fn()} onOpenChange={vi.fn()} open />
      </PosCartProvider>,
    );

    await screen.findByText("2 x Nasi Goreng");

    expect(screen.getAllByText(/Rp\s?40\.000/).length).toBeGreaterThan(0);
  });

  it("does not report success when the request is unauthorized", async () => {
    const user = userEvent.setup();
    const onCreated = vi.fn();
    fetchMock.mockImplementation(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);

        if (url === "/api/orders" && init?.method === "POST") {
          return jsonResponse(
            { code: "UNAUTHORIZED", detail: "Sesi berakhir." },
            401,
          );
        }

        return mockCatalogResponse(url, init);
      },
    );
    seedCart();

    renderWithProviders(
      <PosCartProvider>
        <PosCheckoutDrawer onCreated={onCreated} onOpenChange={vi.fn()} open />
      </PosCartProvider>,
    );

    await screen.findByText("2 x Croissant");
    await user.click(
      screen.getByRole("button", { name: "Konfirmasi pesanan" }),
    );

    expect(await screen.findByText("Sesi berakhir.")).toBeDefined();
    expect(onCreated).not.toHaveBeenCalled();
    expect(screen.queryByText("Pesanan dibuat")).toBeNull();
  });

  it("rotates the idempotency key after a validation failure", async () => {
    const user = userEvent.setup();
    let attempts = 0;
    fetchMock.mockImplementation(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);

        if (url === "/api/orders" && init?.method === "POST") {
          attempts += 1;
          if (attempts === 1) {
            return jsonResponse(
              { code: "VALIDATION_ERROR", detail: "Meja tidak tersedia." },
              422,
            );
          }
          return jsonResponse(order, 201);
        }

        return mockCatalogResponse(url, init);
      },
    );
    seedCart();

    renderWithProviders(
      <PosCartProvider>
        <PosCheckoutDrawer onCreated={vi.fn()} onOpenChange={vi.fn()} open />
      </PosCartProvider>,
    );

    await screen.findByText("2 x Croissant");
    const submit = screen.getByRole("button", {
      name: "Konfirmasi pesanan",
    });

    await user.click(submit);
    await screen.findByText("Meja tidak tersedia.");
    await user.click(submit);

    await waitFor(() => expect(postCalls()).toHaveLength(2));

    const [first, second] = postCalls();
    expect(idempotencyKey(first)).not.toBe(idempotencyKey(second));
  });
});

describe("POS payment", () => {
  it("records the applied cash amount and invalidates order payments", async () => {
    const user = userEvent.setup();
    let paymentReads = 0;
    fetchMock.mockImplementation(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);

        if (url === "/api/orders/order-1/payments" && !init?.method) {
          paymentReads += 1;
          return jsonResponse([]);
        }

        if (url === "/api/orders/order-1/payments" && init?.method === "POST") {
          return jsonResponse(
            {
              id: "payment-1",
              orderId: "order-1",
              method: "CASH",
              amount: 28000,
              status: "RECORDED",
              reference: "",
              notes: "",
              recordedBy: "user-cashier",
              paidAt: "2026-11-15T08:00:00.000Z",
              createdAt: "2026-11-15T08:00:00.000Z",
            },
            201,
          );
        }

        return mockCatalogResponse(url, init);
      },
    );

    renderWithProviders(
      <PosPaymentDrawer onOpenChange={vi.fn()} open order={order} />,
    );

    const amountInput = await screen.findByLabelText(/^Uang diterima/);
    await user.clear(amountInput);
    await user.type(amountInput, "30000");
    await user.click(screen.getByRole("button", { name: "Catat pembayaran" }));

    await waitFor(() => expect(paymentPosts()).toHaveLength(1));

    const [call] = paymentPosts();
    const body = JSON.parse((call[1] as RequestInit).body as string);

    expect(body).toMatchObject({
      method: "CASH",
      amount: 28000,
      verified: false,
    });
    expect(idempotencyKey(call)).toBeTruthy();
    expect(await screen.findByText("Pembayaran lunas")).toBeDefined();
    await waitFor(() => expect(paymentReads).toBeGreaterThan(1));
  });

  it("prefills declared cash and records only the bill amount", async () => {
    const user = userEvent.setup();
    const cashOrder = { ...order, cashTendered: 30000 };

    fetchMock.mockImplementation(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);

        if (url === "/api/orders/order-1/payments" && !init?.method) {
          return jsonResponse([]);
        }
        if (url === "/api/orders/order-1/payments" && init?.method === "POST") {
          return jsonResponse({}, 201);
        }
        return mockCatalogResponse(url, init);
      },
    );

    renderWithProviders(
      <PosPaymentDrawer onOpenChange={vi.fn()} open order={cashOrder} />,
    );

    const amountInput = (await screen.findByLabelText(
      /^Uang diterima/,
    )) as HTMLInputElement;

    await waitFor(() => expect(amountInput.value).toBe("30000"));
    expect(screen.getByText("Kembalian").parentElement?.textContent).toContain(
      "2.000",
    );
    expect(screen.getByText(/Pelanggan menyiapkan/)).toBeDefined();

    await user.click(screen.getByRole("button", { name: "Catat pembayaran" }));
    await waitFor(() => expect(paymentPosts()).toHaveLength(1));

    const body = JSON.parse(
      (paymentPosts()[0][1] as RequestInit).body as string,
    );

    expect(body).toMatchObject({ method: "CASH", amount: 28000 });
  });

  it("shows declared cash and change in the payable list", async () => {
    fetchMock.mockImplementation(async (input: RequestInfo | URL) =>
      String(input) === "/api/orders/payable"
        ? jsonResponse([{ ...order, cashTendered: 30000 }])
        : jsonResponse({}, 404),
    );

    renderWithProviders(
      <PosPayableOrderDrawer onOpenChange={vi.fn()} onPay={vi.fn()} open />,
    );

    expect(await screen.findByText(/Tunai disiapkan/)).toBeDefined();
    expect(screen.getByText(/Kembalian/).textContent).toContain("2.000");
  });
});

async function mockCatalogResponse(url: string, init?: RequestInit) {
  if (url.startsWith("/api/categories?")) {
    return jsonResponse(pageOf([]));
  }

  if (url.startsWith("/api/products?")) {
    return jsonResponse(pageOf([croissant]));
  }

  if (url === "/api/add-ons") {
    return jsonResponse([]);
  }

  if (url.startsWith("/api/tables?")) {
    return jsonResponse(pageOf([]));
  }

  if (url === "/api/orders/order-1/payments" && !init?.method) {
    return jsonResponse([]);
  }

  return jsonResponse({}, 404);
}

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
import { OrderDetailDrawer } from "@/features/management/order-detail-drawer";
import type { SessionUser } from "@/types/auth";
import type { Order } from "@/types/domain";
import { renderWithProviders } from "../helpers/render";

const fetchMock = vi.fn();

const owner: SessionUser = {
  id: "user-owner",
  name: "Rina Pemilik",
  email: "owner@ravika.id",
  username: "owner",
  role: "OWNER",
  roleLabel: "Pemilik",
  permissions: [
    "orders.view",
    "orders.cancel",
    "payments.view",
    "payments.refund",
  ],
};

const supervisor: SessionUser = {
  ...owner,
  permissions: ["orders.view", "orders.cancel", "payments.view"],
};

const paidOrder: Order = {
  id: "order-1",
  businessId: "business-ravika",
  orderNumber: "RVK-2100",
  orderType: "TAKEAWAY",
  source: "CASHIER",
  tableId: "table-1",
  tableName: "Meja 01",
  createdByName: "Bagas Kasir",
  orderStatus: "COMPLETED",
  paymentStatus: "PAID",
  publicToken: null,
  subtotal: 28000,
  grandTotal: 28000,
  cashTendered: null,
  notes: "",
  createdBy: "user-cashier",
  createdAt: "2026-11-15T08:00:00.000Z",
  updatedAt: "2026-11-15T08:00:00.000Z",
  items: [
    {
      id: "item-1",
      productId: "product-croissant",
      productName: "Croissant",
      variantName: null,
      quantity: 1,
      unitPrice: 28000,
      lineTotal: 28000,
      notes: "",
      addOns: [],
    },
  ],
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status,
  });
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
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function mockApi(order: Order, refundResponse: () => Response) {
  fetchMock.mockImplementation(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url === "/api/orders/order-1" && !init?.method) {
        return jsonResponse(order);
      }

      if (url === "/api/orders/order-1/payments" && !init?.method) {
        return jsonResponse([]);
      }

      if (url === "/api/orders/order-1/history" && !init?.method) {
        return jsonResponse([]);
      }

      if (url === "/api/orders/order-1/refund" && init?.method === "POST") {
        return refundResponse();
      }

      return jsonResponse({}, 404);
    },
  );
}

function renderDrawer(user: SessionUser, order: Order = paidOrder) {
  return renderWithProviders(
    <OrderDetailDrawer
      onOpenChange={vi.fn()}
      onOrderChanged={vi.fn()}
      order={order}
    />,
    { user },
  );
}

describe("order refund", () => {
  it("posts a refund with an idempotency key for a paid order", async () => {
    const user = userEvent.setup();
    mockApi(paidOrder, () =>
      jsonResponse({ id: "refund-1", orderId: "order-1" }, 201),
    );
    renderDrawer(owner);

    const refundButton = await screen.findByRole("button", {
      name: "Refund pesanan",
    });
    await user.click(refundButton);

    await user.type(screen.getByLabelText(/^Alasan refund/), "Salah input");
    await user.click(screen.getByRole("button", { name: "Proses refund" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/orders/order-1/refund",
        expect.objectContaining({ method: "POST" }),
      );
    });

    const call = fetchMock.mock.calls.find(
      ([url, init]) =>
        url === "/api/orders/order-1/refund" && init?.method === "POST",
    );
    const headers = new Headers((call?.[1] as RequestInit).headers);

    expect(headers.get("Idempotency-Key")).toBeTruthy();
    expect(JSON.parse((call?.[1] as RequestInit).body as string)).toEqual({
      reason: "Salah input",
    });
    expect(await screen.findByText("Refund tercatat")).toBeDefined();
  });

  it("hides the refund action without the refund permission", async () => {
    mockApi(paidOrder, () => jsonResponse({}, 201));
    renderDrawer(supervisor);

    await screen.findByText(/RVK-2100/);

    expect(screen.queryByRole("button", { name: "Refund pesanan" })).toBeNull();
  });

  it("hides the refund action when the order is not paid", async () => {
    const unpaidOrder = { ...paidOrder, paymentStatus: "UNPAID" as const };
    mockApi(unpaidOrder, () => jsonResponse({}, 201));
    renderDrawer(owner, unpaidOrder);

    await screen.findByText(/RVK-2100/);

    expect(screen.queryByRole("button", { name: "Refund pesanan" })).toBeNull();
  });

  it("shows the cancel action for a refunded order", async () => {
    const refundedOrder = {
      ...paidOrder,
      orderStatus: "PREPARING" as const,
      paymentStatus: "REFUNDED" as const,
    };
    mockApi(refundedOrder, () => jsonResponse({}, 201));
    renderDrawer(owner, refundedOrder);

    expect(
      await screen.findByRole("button", { name: "Batalkan pesanan" }),
    ).toBeDefined();
  });

  it("hides the cancel action while a payment is recorded", async () => {
    const paidPreparingOrder = { ...paidOrder, orderStatus: "NEW" as const };
    mockApi(paidPreparingOrder, () => jsonResponse({}, 201));
    renderDrawer(owner, paidPreparingOrder);

    await screen.findByText(/RVK-2100/);

    expect(
      screen.queryByRole("button", { name: "Batalkan pesanan" }),
    ).toBeNull();
    expect(screen.getByText(/Pembayaran sudah tercatat/)).toBeDefined();
  });
});

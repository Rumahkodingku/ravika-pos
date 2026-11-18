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
import PaymentsPage from "@/app/(dashboard)/app/payments/page";
import type { SessionUser } from "@/types/auth";
import type { Payment } from "@/types/domain";
import { renderWithProviders } from "../helpers/render";

const fetchMock = vi.fn();

const owner: SessionUser = {
  id: "user-owner",
  name: "Rina Pemilik",
  email: "owner@ravika.id",
  username: "owner",
  role: "OWNER",
  roleLabel: "Pemilik",
  permissions: ["payments.view", "orders.view"],
};

const payment: Payment = {
  id: "payment-1",
  orderId: "order-1",
  orderNumber: "RVK-2100",
  method: "CASH",
  amount: 28000,
  status: "RECORDED",
  reference: "TUNAI-1",
  notes: "",
  recordedBy: "user-cashier",
  recordedByName: "Bagas Kasir",
  paidAt: "2026-11-15T08:00:00.000Z",
  createdAt: "2026-11-15T08:00:00.000Z",
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
  fetchMock.mockImplementation(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url.startsWith("/api/payments?")) {
        return jsonResponse({
          items: [payment],
          page: 1,
          pageCount: 1,
          pageSize: 10,
          total: 1,
        });
      }

      if (url === "/api/payments/payment-1" && !init?.method) {
        return jsonResponse(payment);
      }

      return jsonResponse({}, 404);
    },
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("PaymentsPage", () => {
  it("renders the order number and recorder name", async () => {
    renderWithProviders(<PaymentsPage />, { user: owner });

    expect((await screen.findAllByText("RVK-2100")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Bagas Kasir").length).toBeGreaterThan(0);
  });

  it("searches payments by order number", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PaymentsPage />, { user: owner });

    await screen.findAllByText("RVK-2100");
    await user.type(screen.getByLabelText("Cari nomor pesanan"), "RVK-2100");

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(([url]) =>
          String(url).includes("search=RVK-2100"),
        ),
      ).toBe(true);
    });
  });
});

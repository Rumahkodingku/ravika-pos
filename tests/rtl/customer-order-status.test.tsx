/** @vitest-environment jsdom */

import { act, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CustomerOrderStatus } from "@/features/operational/customer-order-status";
import { renderWithProviders } from "../helpers/render";

const fetchMock = vi.fn();

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status,
  });
}

function statusReads() {
  return fetchMock.mock.calls.filter(
    ([url, init]) =>
      String(url) === "/api/public/orders/public-200" && !init?.method,
  ).length;
}

function statusPayload(orderStatus: "NEW" | "PREPARING") {
  return {
    orderNumber: "RVK-200",
    orderStatus,
    paymentStatus: "UNPAID",
    grandTotal: 30000,
    tableName: "Meja 05",
    createdAt: "2026-11-18T08:00:00.000Z",
    items: [
      {
        productName: "Kopi Susu",
        variantName: null,
        quantity: 1,
        unitPrice: 30000,
        lineTotal: 30000,
        addOns: [{ name: "Extra Shot", price: 5000, quantity: 1 }],
      },
    ],
  };
}

async function flush() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("customer order status", () => {
  it("polls the public order every 10 seconds", async () => {
    let reads = 0;
    fetchMock.mockImplementation(async () => {
      reads += 1;
      return jsonResponse(statusPayload(reads === 1 ? "NEW" : "PREPARING"));
    });

    renderWithProviders(<CustomerOrderStatus publicToken="public-200" />);
    await flush();

    expect(screen.getByText("RVK-200")).toBeDefined();
    expect(screen.getAllByText("Baru").length).toBeGreaterThan(0);
    expect(
      screen.getByText("Meja 05. Pembayaran dilakukan di kasir."),
    ).toBeDefined();
    expect(statusReads()).toBe(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });
    await flush();

    expect(statusReads()).toBe(2);
    expect(screen.getAllByText("Disiapkan").length).toBeGreaterThan(0);
  });

  it("shows the empty state for an unknown public token", async () => {
    fetchMock.mockImplementation(async () =>
      jsonResponse(
        { code: "ORDER_NOT_FOUND", detail: "Pesanan tidak ditemukan." },
        404,
      ),
    );

    renderWithProviders(<CustomerOrderStatus publicToken="public-200" />);
    await flush();

    expect(screen.getByText("Pesanan tidak ditemukan")).toBeDefined();
  });
});

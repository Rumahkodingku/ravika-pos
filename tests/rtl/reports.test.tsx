/** @vitest-environment jsdom */

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DashboardPage from "@/app/(dashboard)/app/page";
import SettingsPage from "@/app/(dashboard)/app/settings/page";
import type { SessionUser } from "@/types/auth";
import type { Business, DashboardSummary, Order } from "@/types/domain";
import { renderWithProviders } from "../helpers/render";

const fetchMock = vi.fn();

vi.mock("@/components/theme/theme-provider", () => ({
  useTheme: () => ({
    resolvedTheme: "light",
    setTheme: vi.fn(),
    theme: "system",
  }),
}));

const owner: SessionUser = {
  id: "user-owner",
  name: "Rina Pemilik",
  email: "owner@ravika.id",
  username: "owner",
  role: "OWNER",
  roleLabel: "Pemilik",
  permissions: [
    "dashboard.view",
    "orders.create",
    "kds.view",
    "reports.view",
    "settings.manage",
    "business.view",
    "business.update",
  ],
};

const order: Order = {
  id: "order-1",
  businessId: "business-ravika",
  orderNumber: "RVK-300",
  orderType: "DINE_IN",
  source: "CASHIER",
  tableId: "table-3",
  tableName: "Meja 03",
  createdByName: "Bagas Kasir",
  orderStatus: "PREPARING",
  paymentStatus: "PAID",
  publicToken: null,
  subtotal: 50000,
  grandTotal: 50000,
  cashTendered: null,
  notes: "",
  createdBy: "user-cashier",
  createdAt: "2026-11-18T08:00:00.000Z",
  updatedAt: "2026-11-18T08:00:00.000Z",
  items: [],
};

function summary(transactionCount: number): DashboardSummary {
  return {
    salesTotal: 150000,
    paidTotal: 150000,
    transactionCount,
    averageTransaction: 50000,
    itemsSold: 8,
    queue: [{ status: "PREPARING", label: "Disiapkan", count: 1 }],
    queueOrders: [order],
    salesTrend: [{ label: "Sen", value: 50000 }],
    topProducts: [{ name: "Kopi Susu", quantity: 4, revenue: 80000 }],
    recentOrders: [order],
  };
}

const business: Business = {
  id: "business-ravika",
  name: "Kopi Ravika",
  code: "RAVIKA",
  address: "Jakarta Selatan",
  phone: "021000",
  createdAt: "2026-11-01T00:00:00.000Z",
  updatedAt: "2026-11-01T00:00:00.000Z",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status,
  });
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function mockDashboard() {
  fetchMock.mockImplementation(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url === "/api/reports/summary?range=today" && !init?.method) {
        return jsonResponse(summary(1));
      }

      if (url === "/api/reports/summary?range=7d" && !init?.method) {
        return jsonResponse(summary(9));
      }

      return jsonResponse({}, 404);
    },
  );
}

function mockSettings() {
  fetchMock.mockImplementation(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url === "/api/business" && !init?.method) {
        return jsonResponse(business);
      }

      if (url === "/api/business" && init?.method === "PATCH") {
        return jsonResponse({ ...business, name: "Kopi Ravika Baru" });
      }

      return jsonResponse({}, 404);
    },
  );
}

describe("DashboardPage", () => {
  it("renders API totals and refetches for a new range", async () => {
    const events = userEvent.setup();
    mockDashboard();
    renderWithProviders(<DashboardPage />, { user: owner });

    expect(await screen.findByText(/Meja 03/)).toBeDefined();
    expect(screen.getByText("Kopi Susu")).toBeDefined();

    await events.selectOptions(
      screen.getByLabelText("Periode dashboard"),
      "7d",
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/reports/summary?range=7d",
        expect.anything(),
      );
    });
  });
});

describe("SettingsPage", () => {
  it("submits the strict business payload", async () => {
    const events = userEvent.setup();
    mockSettings();
    renderWithProviders(<SettingsPage />, { user: owner });

    const name = await screen.findByLabelText(/^Nama bisnis/);
    await waitFor(() => {
      expect((name as HTMLInputElement).value).toBe("Kopi Ravika");
    });

    await events.clear(name);
    await events.type(name, "Kopi Ravika Baru");
    await events.click(
      screen.getByRole("button", { name: "Simpan pengaturan" }),
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/business",
        expect.objectContaining({ method: "PATCH" }),
      );
    });

    const call = fetchMock.mock.calls.find(
      ([url, init]) => url === "/api/business" && init?.method === "PATCH",
    );

    expect(JSON.parse((call?.[1] as RequestInit).body as string)).toEqual({
      address: "Jakarta Selatan",
      code: "RAVIKA",
      name: "Kopi Ravika Baru",
      phone: "021000",
    });
  });
});

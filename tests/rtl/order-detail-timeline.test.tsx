/** @vitest-environment jsdom */

import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OrderDetailDrawer } from "@/features/management/order-detail-drawer";
import type { SessionUser } from "@/types/auth";
import type { Order, OrderStatusHistory } from "@/types/domain";
import { renderWithProviders } from "../helpers/render";

vi.mock("@/features/management/api/orders", () => ({
  useCancelOrderMutation: vi.fn(),
  useOrderHistoryQuery: vi.fn(),
  useOrderPaymentsQuery: vi.fn(),
  useOrderQuery: vi.fn(),
  useRefundOrderMutation: vi.fn(),
}));

import {
  useCancelOrderMutation,
  useOrderHistoryQuery,
  useOrderPaymentsQuery,
  useOrderQuery,
  useRefundOrderMutation,
} from "@/features/management/api/orders";

const mockUser: SessionUser = {
  id: "user-owner",
  name: "Rina Pemilik",
  email: "owner@ravika.id",
  username: "owner",
  role: "OWNER",
  roleLabel: "Pemilik",
  permissions: ["orders.view", "orders.cancel", "payments.refund"],
};

const order: Order = {
  id: "order-1",
  businessId: "business-ravika",
  orderNumber: "RVK-2026",
  orderType: "DINE_IN",
  source: "CASHIER",
  tableId: "table-1",
  tableName: "Meja 01",
  createdByName: "Rina Pemilik",
  orderStatus: "PREPARING",
  paymentStatus: "UNPAID",
  publicToken: null,
  subtotal: 28000,
  grandTotal: 28000,
  cashTendered: null,
  notes: "",
  createdBy: "user-owner",
  createdAt: "2026-11-18T00:00:00.000Z",
  updatedAt: "2026-11-18T00:00:00.000Z",
  items: [],
};

const history: OrderStatusHistory[] = [
  {
    id: "history-1",
    orderId: "order-1",
    previousStatus: null,
    newStatus: "NEW",
    changedBy: "user-owner",
    changedByName: "Rina Pemilik",
    reason: "",
    createdAt: "2026-11-18T00:00:00.000Z",
  },
  {
    id: "history-2",
    orderId: "order-1",
    previousStatus: "NEW",
    newStatus: "ACCEPTED",
    changedBy: "user-barista",
    changedByName: "Nadia Barista",
    reason: "",
    createdAt: "2026-11-18T00:01:00.000Z",
  },
  {
    id: "history-3",
    orderId: "order-1",
    previousStatus: "ACCEPTED",
    newStatus: "PREPARING",
    changedBy: "user-barista",
    changedByName: "Nadia Barista",
    reason: "",
    createdAt: "2026-11-18T00:02:00.000Z",
  },
];

describe("order detail timeline", () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = vi.fn(function showModal(
      this: HTMLDialogElement,
    ) {
      this.open = true;
    });
    HTMLDialogElement.prototype.close = vi.fn(function close(
      this: HTMLDialogElement,
    ) {
      this.open = false;
    });

    vi.mocked(useOrderQuery).mockReturnValue({
      data: order,
      error: null,
      isLoading: false,
    } as never);
    vi.mocked(useOrderPaymentsQuery).mockReturnValue({
      data: [],
      error: null,
      isLoading: false,
    } as never);
    vi.mocked(useOrderHistoryQuery).mockReturnValue({
      data: history,
      error: null,
      isLoading: false,
    } as never);
    vi.mocked(useCancelOrderMutation).mockReturnValue({
      isPending: false,
      mutateAsync: vi.fn(),
    } as never);
    vi.mocked(useRefundOrderMutation).mockReturnValue({
      isPending: false,
      mutateAsync: vi.fn(),
    } as never);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders completed steps with a green check and pending steps with a clock", () => {
    renderWithProviders(
      <OrderDetailDrawer onOpenChange={() => {}} order={order} />,
      { user: mockUser },
    );

    expect(screen.getAllByLabelText("Selesai")).toHaveLength(2);
    expect(screen.getAllByLabelText("Belum selesai")).toHaveLength(3);
  });

  it("shows history loading and error states", () => {
    vi.mocked(useOrderHistoryQuery).mockReturnValue({
      data: [],
      error: new Error("Gagal"),
      isLoading: false,
    } as never);

    renderWithProviders(
      <OrderDetailDrawer onOpenChange={() => {}} order={order} />,
      { user: mockUser },
    );

    expect(screen.getByText("Riwayat gagal dimuat.")).toBeTruthy();
    expect(screen.queryByLabelText("Selesai")).toBeNull();
  });
});

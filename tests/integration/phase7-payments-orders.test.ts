import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createDatabase,
  type DatabaseBundle,
} from "@/infrastructure/database/client";
import { createOrder, getOrderHistory } from "@/modules/orders/order.service";
import {
  listOrderPayments,
  listPayments,
  recordPayment,
} from "@/modules/payments/payment.service";
import { seedTestDatabase } from "../helpers/test-fixtures";

const businessId = "business-ravika";
let bundle: DatabaseBundle;

beforeEach(async () => {
  bundle = await createDatabase(":memory:", { bootstrap: false });
  await seedTestDatabase(bundle);
});

afterEach(() => {
  bundle.close();
});

async function createCashOrder() {
  return createOrder(
    bundle.db,
    businessId,
    {
      orderType: "TAKEAWAY",
      tableId: null,
      notes: "",
      items: [
        {
          productId: "product-croissant",
          variantId: null,
          addOnIds: [],
          quantity: 1,
          notes: "",
        },
      ],
    },
    "user-cashier",
  );
}

describe("phase 7 payment and order history enrichment", () => {
  it("returns the order number and recorder name in payments", async () => {
    const order = await createCashOrder();

    const payment = await recordPayment(
      bundle.db,
      businessId,
      order.id,
      {
        method: "CASH",
        amount: order.grandTotal,
        reference: "TUNAI-1",
        notes: "",
        verified: false,
      },
      "user-cashier",
    );

    const result = await listPayments(bundle.db, businessId, { pageSize: 100 });
    const listed = result.items.find((item) => item.id === payment.id);

    expect(listed).toMatchObject({
      orderNumber: order.orderNumber,
      recordedByName: "Bagas Kasir",
    });

    const orderPayments = await listOrderPayments(
      bundle.db,
      businessId,
      order.id,
    );

    expect(orderPayments[0]).toMatchObject({
      orderNumber: order.orderNumber,
      recordedByName: "Bagas Kasir",
    });
  });

  it("finds payments by order number", async () => {
    const order = await createCashOrder();

    await recordPayment(
      bundle.db,
      businessId,
      order.id,
      {
        method: "CASH",
        amount: order.grandTotal,
        reference: "TUNAI-2",
        notes: "",
        verified: false,
      },
      "user-cashier",
    );

    const result = await listPayments(bundle.db, businessId, {
      search: order.orderNumber,
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].orderId).toBe(order.id);
  });

  it("returns the changer name in order history", async () => {
    const order = await createCashOrder();
    const history = await getOrderHistory(bundle.db, businessId, order.id);

    expect(history[0]).toMatchObject({
      newStatus: "NEW",
      changedByName: "Bagas Kasir",
    });
  });
});

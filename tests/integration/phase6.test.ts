import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createDatabase,
  type DatabaseBundle,
} from "@/infrastructure/database/client";
import { payments as paymentsTable } from "@/infrastructure/database/schema";
import { formatDateKey } from "@/lib/format";
import {
  createBackup,
  listBackups,
  restoreBackup,
} from "@/modules/backup/backup.service";
import {
  createProduct,
  listCategories,
  moveCategory,
} from "@/modules/catalog/catalog.service";
import { publishRealtime, subscribeRealtime } from "@/modules/events/event-bus";
import { findIdempotentResponse } from "@/modules/idempotency/idempotency.service";
import {
  cancelOrder,
  createOrder,
  getOrder,
  listKdsOrders,
  updateKdsStatus,
} from "@/modules/orders/order.service";
import { recordPayment, refundOrder } from "@/modules/payments/payment.service";
import { getSalesReport, getSummary } from "@/modules/reports/report.service";
import {
  createRole,
  setRolePermissions,
  updateRole,
} from "@/modules/roles/role.service";
import {
  createTable,
  getPublicMenu,
  getTable,
  regenerateTableToken,
} from "@/modules/tables/table.service";
import { createUser, updateUserById } from "@/modules/users/user.service";
import { seedTestDatabase } from "../helpers/test-fixtures";

const originalDbPath = process.env.RAVIKA_DB_PATH;
let bundle: DatabaseBundle;
const businessId = "business-ravika";

beforeEach(async () => {
  bundle = await createDatabase(":memory:", { bootstrap: false });
  await seedTestDatabase(bundle);
});

afterEach(() => {
  bundle.close();
});

async function newOrder(input?: {
  tableId?: string | null;
  quantity?: number;
}) {
  return createOrder(
    bundle.db,
    businessId,
    {
      orderType: input?.tableId === null ? "TAKEAWAY" : "DINE_IN",
      tableId: input?.tableId ?? "table-1",
      notes: "",
      items: [
        {
          productId: "product-espresso",
          variantId: "variant-espresso-large",
          addOnIds: ["addon-extra-shot"],
          quantity: input?.quantity ?? 1,
          notes: "",
        },
      ],
    },
    "user-cashier",
  );
}

describe("phase 6 users and roles", () => {
  it("creates and updates a user, then blocks duplicate email", async () => {
    const user = await createUser(bundle.db, businessId, {
      name: "Kasir Baru",
      email: "Kasir.Baru@ravika.id",
      role: "CASHIER",
      password: "rahasia123",
      isActive: true,
    });

    expect(user.email).toBe("kasir.baru@ravika.id");
    expect(user.username).toBe("kasir.baru");
    expect(user).not.toHaveProperty("passwordHash");

    const updated = await updateUserById(bundle.db, businessId, user.id, {
      name: "Kasir Update",
      email: "kasir.baru@ravika.id",
      username: "kasirbaru",
      role: "CASHIER",
      isActive: false,
    });

    expect(updated.name).toBe("Kasir Update");
    expect(updated.isActive).toBe(false);

    await expect(
      createUser(bundle.db, businessId, {
        name: "Duplikat",
        email: "kasir.baru@ravika.id",
        role: "CASHIER",
        password: "rahasia123",
        isActive: true,
      }),
    ).rejects.toMatchObject({ code: "USER_EMAIL_CONFLICT" });
  });

  it("guards the last active owner", async () => {
    await expect(
      updateUserById(bundle.db, businessId, "user-owner", {
        name: "Rina Pemilik",
        email: "owner@ravika.id",
        username: "owner",
        role: "CASHIER",
        isActive: true,
      }),
    ).rejects.toMatchObject({ code: "LAST_OWNER_GUARD" });
  });

  it("creates custom roles, replaces permissions, and locks system codes", async () => {
    const role = await createRole(bundle.db, businessId, {
      name: "Supervisor",
      code: "supervisor",
      description: "",
      permissionCodes: ["orders.view"],
    });

    expect(role.code).toBe("SUPERVISOR");
    expect(role.permissionCodes).toEqual(["orders.view"]);

    const updated = await setRolePermissions(bundle.db, businessId, role.id, [
      "orders.view",
      "orders.cancel",
    ]);

    expect(updated.permissionCodes.sort()).toEqual([
      "orders.cancel",
      "orders.view",
    ]);

    await expect(
      updateRole(bundle.db, businessId, "role-owner", {
        name: "Owner",
        code: "OWNER_BARU",
        description: "",
      }),
    ).rejects.toMatchObject({ code: "ROLE_CODE_IMMUTABLE" });
  });
});

describe("phase 6 catalog", () => {
  it("moves a category by swapping sort order", async () => {
    const before = await listCategories(bundle.db, businessId, {});
    const beforeNames = before.items.map((category) => category.name);

    const after = await moveCategory(
      bundle.db,
      businessId,
      "category-teh",
      "up",
    );
    const afterNames = after.items.map((category) => category.name);

    expect(afterNames[1]).toBe("Teh");
    expect(afterNames[2]).toBe(beforeNames[1]);
  });

  it("creates a product with variants and add-ons", async () => {
    const product = await createProduct(bundle.db, businessId, {
      name: "Latte Baru",
      description: "",
      categoryId: "category-kopi",
      basePrice: 30000,
      isAvailable: true,
      isActive: true,
      variants: [{ name: "Large", priceAdjustment: 4000, isActive: true }],
      addOns: [
        {
          addOnId: "addon-extra-shot",
          isRequired: false,
          minSelection: 0,
          maxSelection: 2,
        },
      ],
    });

    expect(product.variants).toHaveLength(1);
    expect(product.addOns[0]?.addOnId).toBe("addon-extra-shot");

    await expect(
      createProduct(bundle.db, businessId, {
        name: "Rusak",
        description: "",
        categoryId: "category-kopi",
        basePrice: 10000,
        isAvailable: true,
        isActive: true,
        variants: [],
        addOns: [
          {
            addOnId: "addon-tidak-ada",
            isRequired: false,
            minSelection: 0,
            maxSelection: 1,
          },
        ],
      }),
    ).rejects.toMatchObject({ code: "VALIDATION_FAILED" });
  });
});

describe("phase 6 tables and QR", () => {
  it("creates a table, decrypts the token, and invalidates old tokens", async () => {
    const table = await createTable(bundle.db, {
      name: "Meja 09",
      status: "AVAILABLE",
      isActive: true,
    });

    expect(table.qrToken).toBeTruthy();
    expect((await getTable(bundle.db, table.id)).qrToken).toBe(table.qrToken);

    const regenerated = await regenerateTableToken(bundle.db, table.id);

    expect(regenerated.qrToken).not.toBe(table.qrToken);
    await expect(getPublicMenu(bundle.db, table.qrToken)).rejects.toMatchObject(
      { code: "QR_TOKEN_INVALID" },
    );
    expect((await getPublicMenu(bundle.db, regenerated.qrToken)).table.id).toBe(
      table.id,
    );
  });
});

describe("phase 6 orders", () => {
  it("computes totals, snapshots, and occupies the table", async () => {
    const order = await newOrder({ quantity: 2 });

    expect(order.subtotal).toBe(64000);
    expect(order.grandTotal).toBe(64000);
    expect(order.items[0]?.variantName).toBe("Large");
    expect(order.items[0]?.unitPrice).toBe(32000);
    expect(order.items[0]?.addOns[0]?.name).toBe("Extra Shot");
    expect(
      bundle.sqlite
        .prepare("select status from tables where id = ?")
        .get("table-1"),
    ).toMatchObject({
      status: "OCCUPIED",
    });
  });

  it("cancels allowed states and rejects orders with payments", async () => {
    const order = await newOrder();

    await cancelOrder(
      bundle.db,
      businessId,
      order.id,
      "Salah input",
      "user-owner",
    );
    expect((await getOrder(bundle.db, businessId, order.id)).orderStatus).toBe(
      "CANCELLED",
    );
    expect(
      bundle.sqlite
        .prepare("select status from tables where id = ?")
        .get("table-1"),
    ).toMatchObject({
      status: "AVAILABLE",
    });

    const paid = await newOrder();

    await recordPayment(
      bundle.db,
      businessId,
      paid.id,
      {
        method: "CASH",
        amount: paid.grandTotal,
        reference: "",
        notes: "",
        verified: false,
      },
      "user-cashier",
    );

    await expect(
      cancelOrder(bundle.db, businessId, paid.id, "Batal", "user-owner"),
    ).rejects.toMatchObject({ code: "ORDER_INVALID_STATE" });
  });

  it("stores an idempotent create response", async () => {
    const order = await createOrder(
      bundle.db,
      businessId,
      {
        orderType: "TAKEAWAY",
        tableId: null,
        notes: "",
        items: [
          {
            productId: "product-kopi-susu",
            variantId: null,
            addOnIds: [],
            quantity: 1,
            notes: "",
          },
        ],
      },
      "user-cashier",
      { key: "idem-order-1", hash: "hash-order-1" },
    );

    const replay = await findIdempotentResponse(bundle.db, {
      businessId,
      key: "idem-order-1",
      operation: "CREATE_ORDER",
      hash: "hash-order-1",
    });

    expect(replay?.status).toBe(201);
    expect(replay?.body).toMatchObject({
      id: order.id,
      orderNumber: order.orderNumber,
    });
  });
});

describe("phase 6 payments and refunds", () => {
  it("records split payments and recalculates status", async () => {
    const order = await newOrder();
    const first = Math.floor(order.grandTotal / 2);

    await recordPayment(
      bundle.db,
      businessId,
      order.id,
      {
        method: "CASH",
        amount: first,
        reference: "",
        notes: "",
        verified: false,
      },
      "user-cashier",
    );
    expect(
      (await getOrder(bundle.db, businessId, order.id)).paymentStatus,
    ).toBe("PARTIALLY_PAID");

    await recordPayment(
      bundle.db,
      businessId,
      order.id,
      {
        method: "QRIS",
        amount: order.grandTotal - first,
        reference: "QR-1",
        notes: "",
        verified: true,
      },
      "user-cashier",
    );
    expect(
      (await getOrder(bundle.db, businessId, order.id)).paymentStatus,
    ).toBe("PAID");
  });

  it("rejects overpayment and unverified digital payments", async () => {
    const order = await newOrder();

    await expect(
      recordPayment(
        bundle.db,
        businessId,
        order.id,
        {
          method: "CASH",
          amount: order.grandTotal + 1,
          reference: "",
          notes: "",
          verified: false,
        },
        "user-cashier",
      ),
    ).rejects.toMatchObject({ code: "PAYMENT_OVERPAID" });

    await expect(
      recordPayment(
        bundle.db,
        businessId,
        order.id,
        {
          method: "QRIS",
          amount: 1000,
          reference: "",
          notes: "",
          verified: false,
        },
        "user-cashier",
      ),
    ).rejects.toMatchObject({ code: "PAYMENT_NOT_VERIFIED" });
  });

  it("refunds a paid order once and keeps preparation status", async () => {
    const order = await newOrder();

    await recordPayment(
      bundle.db,
      businessId,
      order.id,
      {
        method: "CASH",
        amount: order.grandTotal,
        reference: "",
        notes: "",
        verified: false,
      },
      "user-cashier",
    );

    const refund = await refundOrder(
      bundle.db,
      businessId,
      order.id,
      "Salah pesanan",
      "user-owner",
    );

    expect(refund.amount).toBe(order.grandTotal);
    expect(
      (await getOrder(bundle.db, businessId, order.id)).paymentStatus,
    ).toBe("REFUNDED");
    const refundedPayments = (
      await bundle.db.select().from(paymentsTable)
    ).filter((payment) => payment.orderId === order.id);

    expect(
      refundedPayments.every((payment) => payment.status === "REFUNDED"),
    ).toBe(true);

    await expect(
      refundOrder(bundle.db, businessId, order.id, "Refund lagi", "user-owner"),
    ).rejects.toMatchObject({ code: "REFUND_NOT_ALLOWED" });
  });
});

describe("phase 6 KDS and events", () => {
  it("walks the KDS state machine and rejects skips", async () => {
    const order = await newOrder();

    await expect(
      updateKdsStatus(bundle.db, businessId, order.id, "READY", "user-barista"),
    ).rejects.toMatchObject({ code: "KDS_TRANSITION_INVALID" });

    let current = order;

    for (const next of [
      "ACCEPTED",
      "PREPARING",
      "READY",
      "COMPLETED",
    ] as const) {
      current = await updateKdsStatus(
        bundle.db,
        businessId,
        order.id,
        next,
        "user-barista",
      );
    }

    expect(current.orderStatus).toBe("COMPLETED");
    expect(
      (await listKdsOrders(bundle.db, businessId)).completed.some(
        (row) => row.id === order.id,
      ),
    ).toBe(true);
  });

  it("delivers events until unsubscribed", () => {
    const received: string[] = [];
    const unsubscribe = subscribeRealtime((event) => received.push(event.type));

    publishRealtime("order.created", { orderId: "order-1" });
    unsubscribe();
    publishRealtime("order.created", { orderId: "order-2" });

    expect(received).toEqual(["order.created"]);
  });
});

describe("phase 6 reports", () => {
  it("computes summary and sales report from seeded data", async () => {
    const summary = await getSummary(bundle.db, businessId, "7d");
    const report = await getSalesReport(bundle.db, businessId, {});

    expect(summary.transactionCount).toBeGreaterThan(0);
    expect(summary.salesTotal).toBeGreaterThanOrEqual(summary.paidTotal);
    expect(summary.queue).toHaveLength(4);
    expect(summary.topProducts.length).toBeGreaterThan(0);
    expect(report.orders.length).toBe(summary.transactionCount);
    expect(report.salesTrend).toHaveLength(7);
  });

  it("filters sales by date range", async () => {
    const today = new Date().toISOString().slice(0, 10);
    const report = await getSalesReport(bundle.db, businessId, {
      dateFrom: today,
      dateTo: today,
    });

    expect(report.orders.length).toBeGreaterThan(0);
    expect(
      report.orders.every((order) => formatDateKey(order.createdAt) === today),
    ).toBe(true);
  });
});

describe("phase 6 backup", () => {
  it("creates a backup with checksum and lists it", async () => {
    const record = await createBackup(bundle, businessId, "user-owner");

    expect(record.status).toBe("READY");
    expect(record.fileSize).toBeGreaterThan(0);
    expect(
      createHash("sha256").update(readFileSync(record.filePath)).digest("hex"),
    ).toBe(record.checksum);
    expect(
      (await listBackups(bundle.db)).some((row) => row.id === record.id),
    ).toBe(true);

    rmSync(record.filePath, { force: true });
  });

  it("rejects restore for in-memory databases", async () => {
    process.env.RAVIKA_DB_PATH = ":memory:";
    const record = await createBackup(bundle, businessId, "user-owner");

    await expect(
      restoreBackup(
        bundle.db,
        bundle,
        businessId,
        { backupId: record.id, confirm: true },
        "user-owner",
      ),
    ).rejects.toMatchObject({ code: "RESTORE_UNAVAILABLE" });

    process.env.RAVIKA_DB_PATH = originalDbPath;
    rmSync(record.filePath, { force: true });
  });

  it("restores to the configured database path and marks restart", async () => {
    const directory = mkdtempSync(join(tmpdir(), "ravika-restore-"));
    const source = join(directory, "source.sqlite");
    const target = join(directory, "target.sqlite");
    const sourceBundle = await createDatabase(source, { bootstrap: false });
    const backupPath = "";

    try {
      await seedTestDatabase(sourceBundle);
      const record = await createBackup(sourceBundle, businessId, "user-owner");

      process.env.RAVIKA_DB_PATH = target;
      const result = await restoreBackup(
        sourceBundle.db,
        sourceBundle,
        businessId,
        { backupId: record.id, confirm: true },
        "user-owner",
      );

      expect(result).toEqual({ restored: true, restartRequired: true });
      expect(statSync(target).size).toBeGreaterThan(0);
    } finally {
      try {
        sourceBundle.close();
      } catch {
        // database already closed by restore
      }
      rmSync(directory, { recursive: true, force: true });
      rmSync(backupPath, { force: true });
      if (originalDbPath === undefined) {
        delete process.env.RAVIKA_DB_PATH;
      } else {
        process.env.RAVIKA_DB_PATH = originalDbPath;
      }
    }
  });
});

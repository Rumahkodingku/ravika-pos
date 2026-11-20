import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createDatabase,
  type DatabaseBundle,
} from "@/infrastructure/database/client";
import {
  ensureDemoData,
  ensureDemoImages,
} from "@/infrastructure/database/demo-data";
import {
  diningTables,
  orders,
  productImages,
  products,
} from "@/infrastructure/database/schema";
import { seedDatabase } from "@/infrastructure/database/seed";

let bundle: DatabaseBundle;
const businessId = "business-ravika";

beforeEach(async () => {
  bundle = await createDatabase(":memory:", { bootstrap: false });
  await seedDatabase(bundle.db, "development");
});

afterEach(() => {
  bundle.close();
  vi.unstubAllGlobals();
});

describe("development demo seed", () => {
  it("creates a large showcase dataset", async () => {
    await ensureDemoData(bundle.db, businessId, new Date());

    const productRows = await bundle.db
      .select()
      .from(products)
      .where(eq(products.businessId, businessId));
    const tableRows = await bundle.db.select().from(diningTables);
    const orderRows = await bundle.db
      .select()
      .from(orders)
      .where(eq(orders.businessId, businessId));

    expect(productRows.length).toBeGreaterThanOrEqual(40);
    expect(tableRows.length).toBeGreaterThanOrEqual(12);
    expect(orderRows.length).toBeGreaterThanOrEqual(100);
    expect(orderRows.some((order) => order.orderStatus === "COMPLETED")).toBe(
      true,
    );
    expect(orderRows.some((order) => order.orderStatus === "PREPARING")).toBe(
      true,
    );
    expect(orderRows.some((order) => order.orderStatus === "READY")).toBe(true);
    expect(orderRows.some((order) => order.orderStatus === "CANCELLED")).toBe(
      true,
    );
  });

  it("seeds images without failing when fetch succeeds", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(new Uint8Array([0xff, 0xd8, 0xff, 0x01]), {
            status: 200,
          }),
      ),
    );

    await ensureDemoImages(bundle.db, businessId);

    const imageRows = await bundle.db.select().from(productImages);

    expect(imageRows.length).toBeGreaterThan(0);
  });
});

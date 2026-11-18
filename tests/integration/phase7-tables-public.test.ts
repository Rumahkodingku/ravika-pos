import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createDatabase,
  type DatabaseBundle,
} from "@/infrastructure/database/client";
import { addOns } from "@/infrastructure/database/schema";
import { seedDatabase } from "@/infrastructure/database/seed";
import { getPublicMenu, listTables } from "@/modules/tables/table.service";

const businessId = "business-ravika";
let bundle: DatabaseBundle;

beforeEach(async () => {
  bundle = await createDatabase(":memory:", { bootstrap: false });
  await seedDatabase(bundle.db, "development");
});

afterEach(() => {
  bundle.close();
});

describe("phase 7 tables and public menu", () => {
  it("returns active order counts in table summaries without qrToken", async () => {
    const result = await listTables(bundle.db, { pageSize: 100 });
    const summary = result.items.find((table) => table.id === "table-2");

    expect(summary).toMatchObject({
      activeOrderCount: 1,
      id: "table-2",
      status: "OCCUPIED",
    });
    expect(summary).not.toHaveProperty("qrToken");
  });

  it("returns referenced active add-ons in the public menu", async () => {
    const menu = await getPublicMenu(bundle.db, "demo-qr-token-table-1");

    expect(menu.addOns).toContainEqual({
      businessId,
      id: "addon-extra-shot",
      isActive: true,
      name: "Extra Shot",
      price: 5000,
    });
    expect(menu.products[0].addOns).toContainEqual(
      expect.objectContaining({ addOnId: "addon-extra-shot" }),
    );
  });

  it("excludes inactive add-ons from the public menu", async () => {
    await bundle.db
      .update(addOns)
      .set({ isActive: false })
      .where(eq(addOns.id, "addon-boba"));

    const menu = await getPublicMenu(bundle.db, "demo-qr-token-table-1");

    expect(menu.addOns.map((addOn) => addOn.id)).not.toContain("addon-boba");
  });
});

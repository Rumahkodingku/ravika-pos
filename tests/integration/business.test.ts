import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { DatabaseBundle } from "@/infrastructure/database/client";
import {
  getBusiness,
  updateBusiness,
} from "@/modules/business/business.service";
import { createTestDatabase } from "../helpers/test-db";

let bundle: DatabaseBundle;

beforeEach(async () => {
  bundle = await createTestDatabase();
});

afterEach(() => {
  bundle.close();
});

describe("business", () => {
  it("reads and updates the business", async () => {
    const before = await getBusiness(bundle.db, "business-ravika");
    const after = await updateBusiness(bundle.db, before.id, {
      name: "RAVIKA Baru",
      code: "RVK",
      address: "Bandung",
      phone: "022-111111",
    });

    expect(after.name).toBe("RAVIKA Baru");
    expect(after.address).toBe("Bandung");
  });

  it("rejects duplicate business code", async () => {
    bundle.sqlite
      .prepare(
        "insert into business (id, name, code, address, phone, created_at, updated_at) values (?, ?, ?, ?, ?, ?, ?)",
      )
      .run("business-other", "Other", "OTH", "", "", Date.now(), Date.now());

    await expect(
      updateBusiness(bundle.db, "business-ravika", {
        name: "RAVIKA",
        code: "OTH",
        address: "",
        phone: "",
      }),
    ).rejects.toMatchObject({ code: "BUSINESS_CODE_CONFLICT" });
  });
});

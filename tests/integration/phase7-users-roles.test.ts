import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createDatabase,
  type DatabaseBundle,
} from "@/infrastructure/database/client";
import { seedDatabase } from "@/infrastructure/database/seed";
import { listRoleOptions } from "@/modules/roles/role.service";
import { getUser } from "@/modules/users/user.service";

const businessId = "business-ravika";
let bundle: DatabaseBundle;

beforeEach(async () => {
  bundle = await createDatabase(":memory:", { bootstrap: false });
  await seedDatabase(bundle.db, "development");
});

afterEach(() => {
  bundle.close();
});

describe("phase 7 users and roles", () => {
  it("returns the role code and label for a user", async () => {
    const user = await getUser(bundle.db, businessId, "user-cashier");

    expect(user.role).toBe("CASHIER");
    expect(user.roleLabel).toBe("Kasir");
  });

  it("lists role options sorted by name", async () => {
    const options = await listRoleOptions(bundle.db, businessId);

    expect(options.map((option) => option.code)).toEqual([
      "BARISTA",
      "CASHIER",
      "OWNER",
    ]);
    expect(options).toContainEqual({
      code: "OWNER",
      id: "role-owner",
      name: "Pemilik",
    });
  });

  it("guards the role options route with users.view", () => {
    const source = readFileSync("src/app/api/roles/options/route.ts", "utf8");

    expect(source).toContain('requirePermission(context, "users.view")');
  });
});

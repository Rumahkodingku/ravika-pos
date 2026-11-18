import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { DatabaseBundle } from "@/infrastructure/database/client";
import { createDatabase } from "@/infrastructure/database/client";
import { seedDatabase } from "@/infrastructure/database/seed";
import { getSetupStatus, runSetup } from "@/modules/setup/setup.service";
import { permissionGroups } from "@/shared/permissions";

let bundle: DatabaseBundle;
const originalEmail = process.env.RAVIKA_BOOTSTRAP_OWNER_EMAIL;
const originalPassword = process.env.RAVIKA_BOOTSTRAP_OWNER_PASSWORD;
const originalName = process.env.RAVIKA_BOOTSTRAP_OWNER_NAME;

beforeEach(async () => {
  delete process.env.RAVIKA_BOOTSTRAP_OWNER_EMAIL;
  delete process.env.RAVIKA_BOOTSTRAP_OWNER_PASSWORD;
  delete process.env.RAVIKA_BOOTSTRAP_OWNER_NAME;

  bundle = await createDatabase(":memory:", { bootstrap: false });
  await seedDatabase(bundle.db, "production");
});

afterEach(() => {
  bundle.close();
  process.env.RAVIKA_BOOTSTRAP_OWNER_EMAIL = originalEmail;
  process.env.RAVIKA_BOOTSTRAP_OWNER_PASSWORD = originalPassword;
  process.env.RAVIKA_BOOTSTRAP_OWNER_NAME = originalName;
});

describe("installation setup", () => {
  it("seeds production without an env owner", async () => {
    const business = await bundle.db.query.business.findFirst();
    const users = await bundle.db.query.users.findMany();
    const roles = await bundle.db.query.roles.findMany();
    const permissions = await bundle.db.query.permissions.findMany();

    expect(business?.id).toBe("business-ravika");
    expect(users).toHaveLength(0);
    expect(roles).toHaveLength(3);
    expect(permissions).toHaveLength(
      permissionGroups.flatMap((group) => group.permissions).length,
    );
  });

  it("reports setup required and creates the first owner", async () => {
    expect(await getSetupStatus(bundle.db)).toEqual({ setupRequired: true });

    const directory = mkdtempSync(join(tmpdir(), "ravika-setup-"));
    const envPath = join(directory, ".env");

    try {
      const result = await runSetup(bundle.db, envPath, {
        address: "Jalan Setup 1",
        businessCode: "setup",
        businessName: "Setup Cafe",
        confirmPassword: "setuppass123",
        ownerEmail: "owner.setup@ravika.id",
        ownerName: "Owner Setup",
        ownerPassword: "setuppass123",
        phone: "021-123",
      });

      expect(result).toEqual({ restartRequired: true, setupComplete: true });

      const users = await bundle.db.query.users.findMany();
      const business = await bundle.db.query.business.findFirst();

      expect(users).toHaveLength(1);
      expect(users[0]?.email).toBe("owner.setup@ravika.id");
      expect(users[0]?.roleId).toBe("role-owner");
      expect(business?.name).toBe("Setup Cafe");
      expect(business?.code).toBe("SETUP");
      expect(readFileSync(envPath, "utf8")).toMatch(/^RAVIKA_QR_TOKEN_KEY=.+/m);

      await expect(
        runSetup(bundle.db, envPath, {
          address: "Jalan Setup 2",
          businessCode: "setup2",
          businessName: "Setup Cafe 2",
          confirmPassword: "setuppass123",
          ownerEmail: "owner2@ravika.id",
          ownerName: "Owner 2",
          ownerPassword: "setuppass123",
          phone: "021-123",
        }),
      ).rejects.toMatchObject({ code: "SETUP_ALREADY_DONE" });
    } finally {
      rmSync(directory, { force: true, recursive: true });
    }
  });

  it("creates an owner from env bootstrap when provided", async () => {
    bundle.close();
    process.env.RAVIKA_BOOTSTRAP_OWNER_EMAIL = "env.owner@ravika.id";
    process.env.RAVIKA_BOOTSTRAP_OWNER_PASSWORD = "envpassword123";

    bundle = await createDatabase(":memory:", { bootstrap: false });
    await seedDatabase(bundle.db, "production");

    const users = await bundle.db.query.users.findMany();

    expect(users).toHaveLength(1);
    expect(users[0]?.email).toBe("env.owner@ravika.id");
  });
});

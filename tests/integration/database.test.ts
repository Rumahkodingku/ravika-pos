import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { DatabaseBundle } from "@/infrastructure/database/client";
import { permissionGroups } from "@/shared/permissions";
import { createTestDatabase } from "../helpers/test-db";
import { seedTestDatabase } from "../helpers/test-fixtures";

let bundle: DatabaseBundle;

beforeEach(async () => {
  bundle = await createTestDatabase();
});

afterEach(() => {
  bundle.close();
});

function scalar(query: string) {
  const row = bundle.sqlite.prepare(query).get();

  return row ? Object.values(row)[0] : null;
}

describe("database", () => {
  it("creates all MVP tables", () => {
    const rows = bundle.sqlite
      .prepare("select name from sqlite_master where type = 'table'")
      .all();
    const names = rows.map((row) => String(Object.values(row)[0]));

    expect(names).toEqual(
      expect.arrayContaining([
        "business",
        "users",
        "roles",
        "permissions",
        "role_permissions",
        "sessions",
        "categories",
        "products",
        "product_variants",
        "add_ons",
        "product_add_ons",
        "tables",
        "orders",
        "order_items",
        "order_item_add_ons",
        "payments",
        "order_status_history",
        "audit_logs",
        "backup_records",
      ]),
    );
  });

  it("enables foreign keys", () => {
    expect(Number(scalar("PRAGMA foreign_keys"))).toBe(1);
  });

  it("seeds idempotently", async () => {
    await seedTestDatabase(bundle);

    const expectedPermissions = permissionGroups.flatMap(
      (group) => group.permissions,
    ).length;

    expect(Number(scalar("select count(*) from business"))).toBe(1);
    expect(Number(scalar("select count(*) from roles"))).toBe(3);
    expect(Number(scalar("select count(*) from users"))).toBe(3);
    expect(Number(scalar("select count(*) from permissions"))).toBe(
      expectedPermissions,
    );
  });

  it("does not store plaintext passwords", () => {
    const row = bundle.sqlite
      .prepare("select password_hash from users where email = ?")
      .get("owner@ravika.id");

    expect(row).toBeTruthy();

    if (!row) {
      throw new Error("Expected owner row");
    }

    expect(String(Object.values(row)[0])).not.toBe("demo123");
  });
});

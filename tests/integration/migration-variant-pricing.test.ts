import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createDatabase } from "@/infrastructure/database/client";

const originalMigrationsDir = process.env.RAVIKA_MIGRATIONS_DIR;
const tempDirs: string[] = [];

function tempDir() {
  const dir = mkdtempSync(join(tmpdir(), "ravika-variant-migration-"));
  tempDirs.push(dir);

  return dir;
}

function oldMigrationsDirectory() {
  const source = resolve(process.cwd(), "drizzle");
  const target = join(tempDir(), "drizzle");
  const journal = JSON.parse(
    readFileSync(join(source, "meta", "_journal.json"), "utf8"),
  ) as {
    entries: Array<{ idx: number; tag: string }>;
    version: string;
  };

  mkdirSync(join(target, "meta"), { recursive: true });

  for (const entry of journal.entries.filter((item) => item.idx <= 4)) {
    cpSync(join(source, `${entry.tag}.sql`), join(target, `${entry.tag}.sql`));
  }

  writeFileSync(
    join(target, "meta", "_journal.json"),
    JSON.stringify({
      ...journal,
      entries: journal.entries.filter((item) => item.idx <= 4),
    }),
  );

  return target;
}

afterEach(() => {
  if (originalMigrationsDir === undefined) {
    delete process.env.RAVIKA_MIGRATIONS_DIR;
  } else {
    process.env.RAVIKA_MIGRATIONS_DIR = originalMigrationsDir;
  }

  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { force: true, recursive: true });
  }
});

describe("variant pricing migration", () => {
  it("preserves effective prices and historical order snapshots", async () => {
    const dir = tempDir();
    const dbPath = join(dir, "old.sqlite");
    process.env.RAVIKA_MIGRATIONS_DIR = oldMigrationsDirectory();

    const oldBundle = await createDatabase(dbPath, { bootstrap: false });
    const sqlite = oldBundle.sqlite;
    const now = Date.now();

    sqlite.exec(`
      INSERT INTO business (id, name, code, address, phone, created_at, updated_at)
      VALUES ('business-1', 'Ravika', 'RAVIKA', '', '', ${now}, ${now});

      INSERT INTO categories (id, business_id, name, description, sort_order, is_active, created_at, updated_at)
      VALUES ('category-1', 'business-1', 'Makanan', '', 0, 1, ${now}, ${now});

      INSERT INTO products (id, business_id, category_id, name, description, base_price, is_available, is_active, created_at, updated_at)
      VALUES
        ('product-single', 'business-1', 'category-1', 'Es Teh', '', 5000, 1, 1, ${now}, ${now}),
        ('product-variant', 'business-1', 'category-1', 'Nasi Goreng', '', 15000, 1, 1, ${now}, ${now}),
        ('product-inactive', 'business-1', 'category-1', 'Nasi Uduk', '', 12000, 1, 1, ${now}, ${now});

      INSERT INTO product_variants (id, product_id, name, price_adjustment, is_active)
      VALUES
        ('variant-regular', 'product-variant', 'Regular', 0, 1),
        ('variant-jumbo', 'product-variant', 'Jumbo', 5000, 1),
        ('variant-inactive', 'product-inactive', 'Besar', 3000, 0);

      INSERT INTO add_ons (id, business_id, name, price, is_active, created_at, updated_at)
      VALUES ('addon-1', 'business-1', 'Telur', 5000, 1, ${now}, ${now});

      INSERT INTO product_add_ons (product_id, add_on_id, is_required, min_selection, max_selection)
      VALUES ('product-variant', 'addon-1', 0, 0, 1);

      INSERT INTO product_images (product_id, mime_type, data, file_size, checksum, created_at, updated_at)
      VALUES ('product-variant', 'image/png', x'00', 1, 'checksum', ${now}, ${now});

      INSERT INTO orders (id, business_id, order_number, order_type, source, order_status, payment_status, subtotal, discount_total, grand_total, notes, created_at, updated_at)
      VALUES ('order-1', 'business-1', 'RVK-2001', 'TAKEAWAY', 'POS', 'COMPLETED', 'PAID', 20000, 0, 20000, '', ${now}, ${now});

      INSERT INTO order_items (id, order_id, product_id, product_name_snapshot, variant_name_snapshot, quantity, unit_price_snapshot, add_on_total_snapshot, line_total, notes)
      VALUES ('item-1', 'order-1', 'product-variant', 'Nasi Goreng', 'Jumbo', 1, 20000, 0, 20000, '');
    `);

    oldBundle.close();

    process.env.RAVIKA_MIGRATIONS_DIR = resolve(process.cwd(), "drizzle");
    const migrated = await createDatabase(dbPath, { bootstrap: false });

    try {
      const variants = migrated.sqlite
        .prepare("SELECT id, price FROM product_variants ORDER BY id")
        .all() as Array<{ id: string; price: number }>;
      const products = migrated.sqlite
        .prepare("SELECT id, base_price FROM products ORDER BY id")
        .all() as Array<{ base_price: number | null; id: string }>;
      const orderItem = migrated.sqlite
        .prepare(
          "SELECT unit_price_snapshot, add_on_total_snapshot, line_total FROM order_items WHERE id = 'item-1'",
        )
        .get() as {
        add_on_total_snapshot: number;
        line_total: number;
        unit_price_snapshot: number;
      };
      const variantColumns = migrated.sqlite
        .prepare("PRAGMA table_info(product_variants)")
        .all() as Array<{ name: string; notnull: number }>;
      const productColumns = migrated.sqlite
        .prepare("PRAGMA table_info(products)")
        .all() as Array<{ name: string; notnull: number }>;
      const relations = migrated.sqlite
        .prepare("SELECT COUNT(*) AS count FROM product_add_ons")
        .get() as { count: number };
      const images = migrated.sqlite
        .prepare("SELECT COUNT(*) AS count FROM product_images")
        .get() as { count: number };
      const violations = migrated.sqlite
        .prepare("PRAGMA foreign_key_check")
        .all();

      expect(variants).toEqual([
        { id: "variant-inactive", price: 15000 },
        { id: "variant-jumbo", price: 20000 },
        { id: "variant-regular", price: 15000 },
      ]);
      expect(products).toEqual([
        { base_price: null, id: "product-inactive" },
        { base_price: 5000, id: "product-single" },
        { base_price: null, id: "product-variant" },
      ]);
      expect(orderItem).toEqual({
        add_on_total_snapshot: 0,
        line_total: 20000,
        unit_price_snapshot: 20000,
      });
      expect(
        variantColumns.find((column) => column.name === "price"),
      ).toMatchObject({ notnull: 1 });
      expect(
        variantColumns.some((column) => column.name === "price_adjustment"),
      ).toBe(false);
      expect(
        productColumns.find((column) => column.name === "base_price"),
      ).toMatchObject({ notnull: 0 });
      expect(relations.count).toBe(1);
      expect(images.count).toBe(1);
      expect(violations).toEqual([]);
    } finally {
      migrated.close();
    }
  });
});

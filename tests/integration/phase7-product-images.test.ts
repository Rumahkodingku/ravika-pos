import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { DatabaseBundle } from "@/infrastructure/database/client";
import { getProduct, listProducts } from "@/modules/catalog/catalog.service";
import {
  getProductImage,
  removeProductImage,
  saveProductImage,
} from "@/modules/catalog/product-image.service";
import { getPublicMenu } from "@/modules/tables/table.service";
import { createTestDatabase } from "../helpers/test-db";

let bundle: DatabaseBundle;
const businessId = "business-ravika";
const productId = "product-espresso";
const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
const png = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00,
]);
const webp = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, 0x04, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
]);

beforeEach(async () => {
  bundle = await createTestDatabase();
});

afterEach(() => {
  bundle.close();
});

describe("product images", () => {
  it("stores, replaces, exposes, and removes a product image", async () => {
    const url = await saveProductImage(bundle.db, businessId, productId, {
      data: jpeg,
      mimeType: "image/jpeg",
    });

    expect(url).toContain(`/api/product-images/${productId}?v=`);

    const image = await getProductImage(bundle.db, productId);
    expect(image.mimeType).toBe("image/jpeg");
    expect(Buffer.from(image.data).equals(Buffer.from(jpeg))).toBe(true);

    const product = await getProduct(bundle.db, businessId, productId);
    expect(product.imageUrl).toBe(url);

    await saveProductImage(bundle.db, businessId, productId, {
      data: png,
      mimeType: "image/png",
    });

    expect((await getProductImage(bundle.db, productId)).mimeType).toBe(
      "image/png",
    );

    await removeProductImage(bundle.db, businessId, productId);

    expect(
      (await getProduct(bundle.db, businessId, productId)).imageUrl,
    ).toBeNull();
  });

  it("includes image URLs in product lists", async () => {
    await saveProductImage(bundle.db, businessId, productId, {
      data: webp,
      mimeType: "image/webp",
    });

    const products = await listProducts(bundle.db, businessId, {
      pageSize: 100,
    });

    expect(
      products.items.find((product) => product.id === productId)?.imageUrl,
    ).toContain(`/api/product-images/${productId}?v=`);

    const menu = await getPublicMenu(bundle.db, "demo-qr-token-table-1");
    expect(
      menu.products.find((product) => product.id === productId)?.imageUrl,
    ).toContain(`/api/product-images/${productId}?v=`);
  });
});

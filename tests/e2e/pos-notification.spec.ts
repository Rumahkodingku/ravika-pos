import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers/auth";

test("pos announces a new QR order in real time", async ({ page }) => {
  await loginAs(page, "owner");

  const categoryResponse = await page.request.post("/api/categories", {
    data: {
      description: "",
      isActive: true,
      name: "E2E Notifikasi",
    },
  });
  const category = await categoryResponse.json();

  const productResponse = await page.request.post("/api/products", {
    data: {
      basePrice: 18000,
      categoryId: category.id,
      description: "",
      isActive: true,
      isAvailable: true,
      name: "Kopi Notifikasi",
      variants: [],
    },
  });
  const product = await productResponse.json();

  const tableResponse = await page.request.post("/api/tables", {
    data: {
      isActive: true,
      name: `Meja Notifikasi ${Date.now()}`,
      status: "AVAILABLE",
    },
  });
  const table = await tableResponse.json();

  await page.goto("/app/pos");
  await expect(page.getByRole("status")).toHaveText(/Terhubung/);

  const orderResponse = await page.request.post("/api/public/orders", {
    data: {
      cashTendered: null,
      items: [
        {
          addOnIds: [],
          notes: "",
          productId: product.id,
          quantity: 1,
          variantId: null,
        },
      ],
      notes: "",
      tableToken: table.qrToken,
    },
    headers: { "Idempotency-Key": crypto.randomUUID() },
  });

  expect(orderResponse.ok()).toBeTruthy();
  await expect(page.getByText("Pesanan Baru Masuk").first()).toBeVisible();

  await page.getByRole("button", { name: "Matikan notifikasi suara" }).click();
  await expect(
    page.getByRole("button", { name: "Aktifkan notifikasi suara" }),
  ).toBeVisible();
});

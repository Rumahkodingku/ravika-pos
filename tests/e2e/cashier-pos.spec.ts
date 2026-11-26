import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers/auth";

test("cashier creates an order and records split payment", async ({ page }) => {
  await loginAs(page, "owner");

  const categoryResponse = await page.request.post("/api/categories", {
    data: {
      description: "",
      isActive: true,
      name: "E2E Kategori",
    },
  });
  const category = await categoryResponse.json();

  await page.request.post("/api/products", {
    data: {
      basePrice: null,
      categoryId: category.id,
      description: "",
      isActive: true,
      isAvailable: true,
      name: "Kopi Susu",
      variants: [{ isActive: true, name: "Large", price: 23000 }],
    },
  });

  const tableSuffix = String(Date.now()).slice(-5);

  await page.request.post("/api/tables", {
    data: {
      isActive: true,
      name: `Meja ${tableSuffix}`,
      status: "AVAILABLE",
    },
  });

  await page.goto("/app/pos");

  await page.getByRole("button", { name: "Tambah Kopi Susu" }).first().click();
  await page.getByRole("button", { name: "Tambahkan" }).click();

  await page.getByRole("button", { name: /Pilih meja/ }).click();
  await page.getByRole("button", { name: /Meja/ }).first().click();
  await page.getByRole("button", { name: "Lanjut ke konfirmasi" }).click();
  await page.getByRole("button", { name: "Konfirmasi pesanan" }).click();
  await expect(
    page.getByRole("heading", { name: "Pesanan berhasil dibuat" }),
  ).toBeVisible({ timeout: 15_000 });

  const orderNumber = (
    await page.getByText(/^RVK-/).first().textContent()
  )?.trim();
  expect(orderNumber).toMatch(/^RVK-\d+$/);

  await page.getByRole("button", { name: "Catat pembayaran" }).click();

  const amount = Number(await page.getByLabel("Uang diterima").inputValue());
  expect(amount).toBeGreaterThan(0);
  await page.getByLabel("Uang diterima").fill(String(Math.floor(amount / 2)));
  await page.getByRole("button", { name: "Catat pembayaran" }).click();
  await expect(page.getByText(/Pembayaran tercatat/)).toBeVisible();

  await page.getByLabel("Metode pembayaran").selectOption("QRIS");
  await page
    .getByLabel("Nominal pembayaran")
    .fill(String(amount - Math.floor(amount / 2)));
  await page.getByLabel("Pembayaran digital sudah diverifikasi").check();
  await page.getByRole("button", { name: "Catat pembayaran" }).click();

  await expect(page.getByText("Pembayaran lunas")).toBeVisible();
  await page.goto("/app/orders");
  await expect(
    page.getByRole("cell", { exact: true, name: orderNumber ?? "" }),
  ).toBeVisible();
  await expect(page.getByRole("cell", { name: "Lunas" }).first()).toBeVisible();
});

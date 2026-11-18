import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers/auth";

test("cashier creates an order and records split payment", async ({ page }) => {
  await loginAs(page, "cashier");
  await page.goto("/app/pos");

  await page.getByRole("button", { name: "Tambah Kopi Susu" }).first().click();
  await page.getByRole("button", { name: "Tambahkan" }).click();

  await page.getByRole("button", { name: /Pilih meja/ }).click();
  await page
    .getByRole("button", { name: /Meja 01/ })
    .first()
    .click();
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
    page.getByRole("cell", { name: orderNumber ?? "" }),
  ).toBeVisible();
  await expect(page.getByRole("cell", { name: "Lunas" }).first()).toBeVisible();
});

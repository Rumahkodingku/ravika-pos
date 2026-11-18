import { expect, test } from "@playwright/test";

test("customer orders from QR menu and opens public status", async ({
  page,
}) => {
  await page.goto("/menu/demo-qr-token-table-1");
  await page.getByRole("button", { name: "Tambah Kopi Susu" }).first().click();
  await page.getByRole("button", { name: "Tambah ke keranjang" }).click();
  await page.getByRole("button", { name: "Lihat keranjang" }).first().click();
  await page.getByRole("button", { name: "Kirim pesanan" }).click();

  await expect(
    page.getByRole("heading", { name: "Pesanan terkirim" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Lihat status pesanan" }).click();
  await expect(
    page.getByRole("heading", { name: "Status pesanan" }),
  ).toBeVisible();
  await expect(page.getByText(/^RVK-/).first()).toBeVisible();

  await page.goto("/menu/invalid-token");
  await expect(
    page.getByRole("heading", { name: "QR tidak valid" }),
  ).toBeVisible();
});

import { expect, test } from "@playwright/test";

test("owner manages catalog, add-on, product image, and table QR", async ({
  page,
}) => {
  const suffix = String(Date.now()).slice(-5);
  const categoryName = `E2E Kategori ${suffix}`;
  const addOnName = `E2E Topping ${suffix}`;
  const productName = `E2E Kopi ${suffix}`;
  const tableName = `E2E Meja ${suffix}`;
  await page.goto("/login");
  await page.getByLabel("Email atau username").fill("owner@ravika.id");
  await page.getByLabel("Kata sandi").fill("demo123");
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page).toHaveURL(/\/app$/);

  await page.goto("/app/categories");
  await page
    .getByRole("button", { exact: true, name: "Tambah kategori" })
    .click();
  await page.getByLabel(/^Nama kategori/).fill(categoryName);
  await page.getByRole("button", { name: "Simpan" }).click();
  await expect(page.getByText(categoryName).first()).toBeVisible();

  await page.goto("/app/add-ons");
  await page
    .getByRole("button", { exact: true, name: "Tambah add-on" })
    .click();
  await page.getByLabel(/^Nama add-on/).fill(addOnName);
  await page.getByLabel(/^Harga/).fill("3000");
  await page.getByRole("button", { name: "Simpan" }).click();
  await expect(page.getByText(addOnName).first()).toBeVisible();

  await page.goto("/app/products");
  await page
    .getByRole("button", { exact: true, name: "Tambah produk" })
    .click();
  await page.getByLabel(/^Nama produk/).fill(productName);
  await page.getByLabel(/^Kategori/).selectOption({ label: categoryName });
  await page.getByLabel(/^Harga dasar/).fill("20000");

  await page.getByRole("button", { name: "Varian" }).click();
  await page.getByLabel(/^Nama varian/).fill("Large");
  await page.getByLabel(/^Tambahan harga/).fill("5000");

  await page.getByRole("button", { name: "Add-on" }).click();
  const addOnValue = await page
    .getByLabel("Add-on")
    .locator("option", { hasText: addOnName })
    .getAttribute("value");
  await page
    .getByLabel("Add-on", { exact: true })
    .selectOption(addOnValue ?? "");

  await page
    .getByLabel("Pilih gambar")
    .setInputFiles("tests/e2e/fixtures/product.jpg");
  await expect(page.getByText("Ganti gambar")).toBeVisible();

  await page.getByRole("button", { name: "Simpan" }).click();
  await expect(
    page.getByRole("button", { name: "E2E Kopi" }).first(),
  ).toBeVisible();

  await page.getByRole("button", { name: productName }).first().click();
  await expect(
    page.getByRole("dialog", { name: productName }).getByRole("img"),
  ).toBeVisible();
  await expect(
    page.getByRole("dialog", { name: productName }).getByText("E2E Topping"),
  ).toBeVisible();

  await page.goto("/app/tables");
  await page.getByRole("button", { exact: true, name: "Tambah meja" }).click();
  await page.getByLabel(/^Nama atau nomor meja/).fill(tableName);
  await page.getByRole("button", { name: "Simpan" }).click();
  await expect(page.getByRole("dialog", { name: "Tambah meja" })).toBeHidden();
  await expect(
    page.getByRole("button", { name: tableName }).first(),
  ).toBeVisible();
});

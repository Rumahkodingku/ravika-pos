import { expect, test } from "@playwright/test";

test("customer orders from QR menu and opens public status", async ({
  page,
}) => {
  await page.request.post("/api/auth/login", {
    data: { identity: "owner@ravika.id", password: "demo123", remember: false },
  });

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
      basePrice: 18000,
      categoryId: category.id,
      description: "",
      isActive: true,
      isAvailable: true,
      name: "Kopi Customer",
      variants: [],
    },
  });

  const tableResponse = await page.request.post("/api/tables", {
    data: {
      isActive: true,
      name: `Meja E2E ${Date.now()}`,
      status: "AVAILABLE",
    },
  });
  const table = await tableResponse.json();

  await page.goto(`/menu/${table.qrToken}`);
  await page
    .getByRole("button", { name: "Tambah Kopi Customer" })
    .first()
    .click();
  await page.getByRole("button", { name: "Lihat keranjang" }).first().click();
  await page.getByRole("radio", { name: "Tunai, siapkan kembalian" }).click();
  await page.getByLabel("Uang tunai").fill("20000");
  await expect(page.getByText(/2\.000/)).toBeVisible();
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

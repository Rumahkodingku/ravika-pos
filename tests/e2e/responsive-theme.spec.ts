import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers/auth";

const viewports = [
  { height: 844, width: 390 },
  { height: 1180, width: 820 },
  { height: 900, width: 1440 },
];

async function expectNoOverflow(page: import("@playwright/test").Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
}

test("public pages stay usable across viewports and themes", async ({
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
      sortOrder: 0,
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
      name: "Kopi Susu",
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

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto(`/menu/${table.qrToken}`);
    await expect(page.getByRole("heading", { name: "Menu" })).toBeVisible();
    await expectNoOverflow(page);
  }

  await page.goto("/login");
  const toggle = page.getByRole("button", { name: /Tema saat ini/ });
  const before = await toggle.getAttribute("aria-label");
  await toggle.click();
  await expect(toggle).not.toHaveAttribute("aria-label", before ?? "");
});

test("kds stays usable on a tablet viewport", async ({ page }) => {
  await loginAs(page, "owner");
  await page.setViewportSize({ height: 1180, width: 820 });
  await page.goto("/kds");
  await expect(
    page.getByRole("heading", { name: "Antrean pesanan" }),
  ).toBeVisible();
  await expectNoOverflow(page);
});

import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers/auth";

async function createStaff(
  page: import("@playwright/test").Page,
  role: "CASHIER" | "BARISTA",
) {
  const response = await page.request.post("/api/users", {
    data: {
      email: `${role.toLowerCase()}@ravika.id`,
      isActive: true,
      name: role === "CASHIER" ? "Kasir E2E" : "Barista E2E",
      password: "demo12345",
      role,
      username: role.toLowerCase(),
    },
  });

  expect(response.ok()).toBeTruthy();
}

test("owner keeps management navigation in POS and KDS", async ({ page }) => {
  await loginAs(page, "owner");

  await page.goto("/app/pos");
  await expect(
    page.getByRole("button", { name: /Menu Lainnya/ }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();

  await page.goto("/kds");
  await expect(
    page.getByRole("button", { name: /Menu Lainnya/ }),
  ).toBeVisible();
});

test("cashier and barista keep compact operational headers", async ({
  page,
}) => {
  await loginAs(page, "owner");
  await createStaff(page, "CASHIER");
  await createStaff(page, "BARISTA");

  await loginAs(page, "cashier", "demo12345");
  await page.goto("/app/pos");
  await expect(page.getByRole("button", { name: /Menu Lainnya/ })).toHaveCount(
    0,
  );
  await expect(page.getByRole("button", { name: "Keluar POS" })).toBeVisible();

  await loginAs(page, "barista", "demo12345");
  await page.goto("/kds");
  await expect(page.getByRole("button", { name: /Menu Lainnya/ })).toHaveCount(
    0,
  );
  await expect(page.getByRole("button", { name: "Keluar KDS" })).toBeVisible();
});

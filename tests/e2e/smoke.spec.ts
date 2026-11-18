import { expect, test } from "@playwright/test";

test("health endpoint and login page are available", async ({ page }) => {
  const response = await page.request.get("/api/health");
  expect(response.status()).toBe(200);

  await page.goto("/login");
  await expect(
    page.getByRole("heading", { name: "Masuk ke RAVIKA POS" }),
  ).toBeVisible();
});

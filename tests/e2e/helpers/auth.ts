import { expect, type Page } from "@playwright/test";

export async function loginAs(
  page: Page,
  identity: string,
  password = "demo123",
) {
  const response = await page.request.post("/api/auth/login", {
    data: { identity, password, remember: false },
  });

  expect(response.ok()).toBeTruthy();
}

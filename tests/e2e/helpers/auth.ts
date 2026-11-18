import { expect, type Page } from "@playwright/test";

export async function loginAs(page: Page, identity: string) {
  const response = await page.request.post("/api/auth/login", {
    data: { identity, password: "demo123", remember: false },
  });

  expect(response.ok()).toBeTruthy();
}

import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers/auth";

test("owner creates, downloads, and uploads a backup", async ({ page }) => {
  await loginAs(page, "owner");
  await page.goto("/app/backup");

  await page.getByRole("button", { name: "Buat backup" }).click();
  await expect(
    page.getByRole("link", { name: "Download" }).first(),
  ).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: "Download" }).first().click();
  const download = await downloadPromise;
  const filePath = await download.path();

  expect(download.suggestedFilename()).toMatch(/^ravika-.*\.sqlite$/);
  expect(filePath).toBeTruthy();

  const uploadResponse = page.waitForResponse(
    (response) =>
      response.url().includes("/api/backup/upload") &&
      response.request().method() === "POST",
  );

  await page.locator('input[type="file"]').setInputFiles({
    buffer: readFileSync(filePath as string),
    mimeType: "application/octet-stream",
    name: "backup.sqlite",
  });
  expect((await uploadResponse).status()).toBe(201);
});

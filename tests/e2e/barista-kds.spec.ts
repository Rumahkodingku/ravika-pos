import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers/auth";

test("barista advances an order and recovers from SSE disconnect", async ({
  context,
  page,
}) => {
  await loginAs(page, "cashier");
  const created = await page.request.post("/api/orders", {
    data: {
      items: [
        {
          addOnIds: [],
          notes: "",
          productId: "product-kopi-susu",
          quantity: 1,
          variantId: null,
        },
      ],
      notes: "E2E KDS",
      orderType: "TAKEAWAY",
      tableId: null,
    },
    headers: { "Idempotency-Key": crypto.randomUUID() },
  });
  expect(created.ok()).toBeTruthy();
  const order = (await created.json()) as { orderNumber: string };

  await loginAs(page, "barista");
  await page.goto("/kds");

  const ticket = page
    .getByText(order.orderNumber)
    .locator("xpath=ancestor::div[contains(@class,'rounded-lg')][1]");

  await ticket.getByRole("button", { name: "Terima" }).click();
  await ticket.getByRole("button", { name: "Mulai siapkan" }).click();
  await ticket.getByRole("button", { name: "Tandai siap" }).click();
  await ticket.getByRole("button", { name: "Selesai" }).click();
  await expect(
    page.getByRole("heading", { name: order.orderNumber }),
  ).toBeVisible();

  await context.setOffline(true);
  await expect(
    page.getByText("Terputus").or(page.getByText("Menyambung ulang")),
  ).toBeVisible({ timeout: 15_000 });
  await context.setOffline(false);
  await expect(page.getByText("Terhubung")).toBeVisible({ timeout: 30_000 });
});

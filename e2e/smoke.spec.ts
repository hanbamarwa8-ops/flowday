import { test, expect } from "@playwright/test";

test("FlowDay landing page should load", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: /Plan your day/i,
    })
  ).toBeVisible();
});
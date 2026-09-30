import { test, expect } from "@playwright/test";

const protectedRoutes = [
  "/dashboard",
  "/tasks",
  "/goals",
  "/habits",
  "/focus",
];

for (const route of protectedRoutes) {
  test(`${route} should redirect unauthenticated users to login`, async ({
    page,
  }) => {
    await page.goto(route);

    await expect(page).toHaveURL(/\/login$/);
  });
}
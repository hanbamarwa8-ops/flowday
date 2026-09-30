import {
    test,
    expect,
  } from "@playwright/test";
  
  test("user can signup, reach dashboard and logout", async ({
    page,
  }) => {
    const email = `e2e-${Date.now()}@example.com`;
  
    await page.goto("/signup");
  
    await expect(
      page.getByRole("heading", {
        name: "Create your account",
      })
    ).toBeVisible();
  
    await page
      .getByLabel("Full name")
      .fill("E2E Test User");
  
    await page
      .getByLabel("Email")
      .fill(email);
  
    await page
      .getByLabel("Password", {
        exact: true,
      })
      .fill("password123");
  
    await page
      .getByLabel("Confirm password")
      .fill("password123");
  
    await page
      .locator("#terms")
      .check();
  
    await page
      .getByRole("button", {
        name: "Sign up",
        exact: true,
      })
      .click();
  
    await expect(page).toHaveURL(
      /\/dashboard$/
    );
  
    await expect(
      page.getByRole("link", {
        name: "Dashboard",
        exact: true,
      })
    ).toBeVisible();
  
    await expect(
      page.getByText("E2E Test User", {
        exact: true,
      })
    ).toBeVisible();
  
    await page
      .getByRole("button", {
        name: "Log out",
        exact: true,
      })
      .click();
  
    await expect(page).toHaveURL(
      /\/$/
    );
  });
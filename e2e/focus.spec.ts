import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

async function createUserAndOpenFocus(page: Page) {
  const email = `focus-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}@example.com`;

  await page.goto("/signup");

  await expect(
    page.getByRole("heading", {
      name: "Create your account",
    })
  ).toBeVisible();

  await page
    .getByLabel("Full name")
    .fill("Focus E2E User");

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

  await page.locator("#terms").check();

  await page
    .getByRole("button", {
      name: "Sign up",
      exact: true,
    })
    .click();

  await expect(page).toHaveURL(
    /\/dashboard$/
  );

  await page.goto("/focus");

  await expect(
    page.getByRole("heading", {
      name: "Focus",
      exact: true,
    })
  ).toBeVisible();
}

test.describe("Focus E2E", () => {
  test("user can start and pause a focus session", async ({
    page,
  }) => {
    await createUserAndOpenFocus(page);

    await expect(
      page.getByText("25:00", {
        exact: true,
      })
    ).toBeVisible();

    await expect(
      page.getByRole("button", {
        name: "Start",
        exact: true,
      })
    ).toBeVisible();

    await page
      .getByRole("button", {
        name: "Start",
        exact: true,
      })
      .click();

    await expect(
      page.getByRole("button", {
        name: "Pause",
        exact: true,
      })
    ).toBeVisible();

    await expect(
      page.getByText(
        "Stay focused on the task in front of you.",
        {
          exact: true,
        }
      )
    ).toBeVisible();

    await page.waitForTimeout(1200);

    const timer = page
      .locator("p")
      .filter({
        hasText: /^\d{2}:\d{2}$/,
      })
      .first();

    await expect(timer).not.toHaveText("25:00");

    await page
      .getByRole("button", {
        name: "Pause",
        exact: true,
      })
      .click();

    await expect(
      page.getByRole("button", {
        name: "Start",
        exact: true,
      })
    ).toBeVisible();

    await expect(
      page.getByText("Ready when you are.", {
        exact: true,
      })
    ).toBeVisible();
  });

  test("user can reset the focus timer", async ({
    page,
  }) => {
    await createUserAndOpenFocus(page);

    await page
      .getByRole("button", {
        name: "Start",
        exact: true,
      })
      .click();

    await page.waitForTimeout(1200);

    await page
      .getByRole("button", {
        name: "Pause",
        exact: true,
      })
      .click();

    await page
      .getByRole("button", {
        name: "Reset",
        exact: true,
      })
      .click();

    await expect(
      page.getByText("25:00", {
        exact: true,
      })
    ).toBeVisible();

    await expect(
      page.getByRole("button", {
        name: "Start",
        exact: true,
      })
    ).toBeVisible();

    await expect(
      page.getByText("Ready when you are.", {
        exact: true,
      })
    ).toBeVisible();
  });
});
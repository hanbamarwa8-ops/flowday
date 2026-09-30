import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

async function createUserAndOpenHabits(page: Page) {
  const email = `habits-${Date.now()}-${Math.random()
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
    .fill("Habits E2E User");

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

  await page.goto("/habits");

  await expect(
    page.getByRole("heading", {
      name: "Habits",
      exact: true,
    })
  ).toBeVisible();
}

test.describe("Habits E2E", () => {
  test("user can create a habit", async ({ page }) => {
    await createUserAndOpenHabits(page);

    const habitName = `E2E Habit ${Date.now()}`;

    await page
      .getByRole("button", {
        name: "New habit",
        exact: true,
      })
      .click();

    await page
      .getByLabel("Habit name")
      .fill(habitName);

    await page
      .getByLabel("Description")
      .fill("Habit created from Playwright");

    await page
      .getByLabel("Frequency")
      .selectOption("daily");

    await page
      .getByRole("button", {
        name: "Create habit",
        exact: true,
      })
      .click();

    const habitCard = page.locator("article", {
      hasText: habitName,
    });

    await expect(habitCard).toBeVisible();

    await expect(
      habitCard.getByText(habitName, {
        exact: true,
      })
    ).toBeVisible();

    await expect(
      habitCard.getByText(
        "Habit created from Playwright",
        {
          exact: true,
        }
      )
    ).toBeVisible();

    await expect(
      habitCard.getByText("daily", {
        exact: true,
      })
    ).toBeVisible();

    await expect(
      habitCard.getByText("0 day streak", {
        exact: true,
      })
    ).toBeVisible();
  });

  test("user can edit a habit", async ({ page }) => {
    await createUserAndOpenHabits(page);

    const originalName = `Original Habit ${Date.now()}`;
    const updatedName = `Updated Habit ${Date.now()}`;

    await page
      .getByRole("button", {
        name: "New habit",
        exact: true,
      })
      .click();

    await page
      .getByLabel("Habit name")
      .fill(originalName);

    await page
      .getByLabel("Description")
      .fill("Original description");

    await page
      .getByRole("button", {
        name: "Create habit",
        exact: true,
      })
      .click();

    const habitCard = page.locator("article", {
      hasText: originalName,
    });

    await expect(habitCard).toBeVisible();

    await habitCard
      .getByRole("button", {
        name: "Edit",
        exact: true,
      })
      .click();

    await habitCard
      .getByLabel("Habit name")
      .fill(updatedName);

    await habitCard
      .getByLabel("Description")
      .fill("Updated description");

    await habitCard
      .getByLabel("Frequency")
      .selectOption("weekly");

    await habitCard
      .getByRole("button", {
        name: "Save changes",
        exact: true,
      })
      .click();

    await expect(
      page.getByText(updatedName, {
        exact: true,
      })
    ).toBeVisible();

    await expect(
      page.getByText("Updated description", {
        exact: true,
      })
    ).toBeVisible();

    await expect(
      page.getByText("weekly", {
        exact: true,
      })
    ).toBeVisible();

    await expect(
      page.getByText(originalName, {
        exact: true,
      })
    ).not.toBeVisible();
  });

  test("user can complete and uncomplete a habit", async ({
    page,
  }) => {
    await createUserAndOpenHabits(page);

    const habitName = `Complete Habit ${Date.now()}`;

    await page
      .getByRole("button", {
        name: "New habit",
        exact: true,
      })
      .click();

    await page
      .getByLabel("Habit name")
      .fill(habitName);

    await page
      .getByRole("button", {
        name: "Create habit",
        exact: true,
      })
      .click();

    const habitCard = page.locator("article", {
      hasText: habitName,
    });

    await expect(habitCard).toBeVisible();

    await habitCard
      .getByRole("button", {
        name: "Mark habit as completed",
      })
      .click();

    await expect(
      habitCard.getByRole("button", {
        name: "Mark habit as incomplete",
      })
    ).toBeVisible();

    await expect(
      habitCard.getByText("1 day streak", {
        exact: true,
      })
    ).toBeVisible();

    await habitCard
      .getByRole("button", {
        name: "Mark habit as incomplete",
      })
      .click();

    await expect(
      habitCard.getByRole("button", {
        name: "Mark habit as completed",
      })
    ).toBeVisible();

    await expect(
      habitCard.getByText("0 day streak", {
        exact: true,
      })
    ).toBeVisible();
  });

  test("user can delete a habit", async ({ page }) => {
    await createUserAndOpenHabits(page);

    const habitName = `Delete Habit ${Date.now()}`;

    await page
      .getByRole("button", {
        name: "New habit",
        exact: true,
      })
      .click();

    await page
      .getByLabel("Habit name")
      .fill(habitName);

    await page
      .getByRole("button", {
        name: "Create habit",
        exact: true,
      })
      .click();

    const habitCard = page.locator("article", {
      hasText: habitName,
    });

    await expect(habitCard).toBeVisible();

    await habitCard
      .getByRole("button", {
        name: "Delete habit",
      })
      .click();

    await expect(
      page.getByText(habitName, {
        exact: true,
      })
    ).not.toBeVisible();
  });
});
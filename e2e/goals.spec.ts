import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

async function createUserAndOpenGoals(page: Page) {
  const email = `goals-${Date.now()}-${Math.random()
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
    .fill("Goals E2E User");

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

  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto("/goals");

  await expect(
    page.getByRole("heading", {
      name: "Goals",
      exact: true,
    })
  ).toBeVisible();
}

test.describe("Goals E2E", () => {
  test("user can create a goal", async ({ page }) => {
    await createUserAndOpenGoals(page);

    const goalTitle = `E2E Goal ${Date.now()}`;

    await page
      .getByRole("button", {
        name: "New goal",
        exact: true,
      })
      .click();

    await page
      .getByLabel("Goal title")
      .fill(goalTitle);

    await page
      .getByLabel("Description")
      .fill("Goal created from Playwright");

    await page
      .getByLabel("Target date")
      .fill("2026-12-31");

    await page
      .getByRole("button", {
        name: "Create goal",
        exact: true,
      })
      .click();

    const goalCard = page.locator("article", {
      hasText: goalTitle,
    });

    await expect(goalCard).toBeVisible();

    await expect(
      goalCard.getByText(goalTitle, {
        exact: true,
      })
    ).toBeVisible();

    await expect(
      goalCard.getByText(
        "Goal created from Playwright",
        {
          exact: true,
        }
      )
    ).toBeVisible();

    await expect(
      goalCard.getByText(/Target:/)
    ).toBeVisible();

    await expect(
      goalCard.getByText("Active", {
        exact: true,
      })
    ).toBeVisible();
  });

  test("user can edit a goal", async ({ page }) => {
    await createUserAndOpenGoals(page);

    const originalTitle = `Original Goal ${Date.now()}`;
    const updatedTitle = `Updated Goal ${Date.now()}`;

    await page
      .getByRole("button", {
        name: "New goal",
        exact: true,
      })
      .click();

    await page
      .getByLabel("Goal title")
      .fill(originalTitle);

    await page
      .getByLabel("Description")
      .fill("Original description");

    await page
      .getByRole("button", {
        name: "Create goal",
        exact: true,
      })
      .click();

    const goalCard = page.locator("article", {
      hasText: originalTitle,
    });

    await expect(goalCard).toBeVisible();

    await goalCard
      .getByRole("button", {
        name: "Edit",
        exact: true,
      })
      .click();

    const editTitle = goalCard.getByLabel(
      "Goal title"
    );

    await editTitle.fill(updatedTitle);

    const editDescription =
      goalCard.getByLabel("Description");

    await editDescription.fill(
      "Updated description"
    );

    await goalCard
      .getByRole("button", {
        name: "Save changes",
        exact: true,
      })
      .click();

    await expect(
      page.getByText(updatedTitle, {
        exact: true,
      })
    ).toBeVisible();

    await expect(
      page.getByText("Updated description", {
        exact: true,
      })
    ).toBeVisible();

    await expect(
      page.getByText(originalTitle, {
        exact: true,
      })
    ).not.toBeVisible();
  });

  test("user can complete and reactivate a goal", async ({
    page,
  }) => {
    await createUserAndOpenGoals(page);

    const goalTitle = `Complete Goal ${Date.now()}`;

    await page
      .getByRole("button", {
        name: "New goal",
        exact: true,
      })
      .click();

    await page
      .getByLabel("Goal title")
      .fill(goalTitle);

    await page
      .getByRole("button", {
        name: "Create goal",
        exact: true,
      })
      .click();

    const goalCard = page.locator("article", {
      hasText: goalTitle,
    });

    await expect(goalCard).toBeVisible();

    await goalCard
      .getByRole("button", {
        name: "Mark completed",
        exact: true,
      })
      .click();

    await expect(
      goalCard.getByText("Completed", {
        exact: true,
      })
    ).toBeVisible();

    await expect(
      goalCard.getByText("100%", {
        exact: true,
      })
    ).toBeVisible();

    await goalCard
      .getByRole("button", {
        name: "Mark active",
        exact: true,
      })
      .click();

    await expect(
      goalCard.getByText("Active", {
        exact: true,
      })
    ).toBeVisible();

    await expect(
      goalCard.getByText("0%", {
        exact: true,
      })
    ).toBeVisible();
  });

  test("user can delete a goal", async ({ page }) => {
    await createUserAndOpenGoals(page);

    const goalTitle = `Delete Goal ${Date.now()}`;

    await page
      .getByRole("button", {
        name: "New goal",
        exact: true,
      })
      .click();

    await page
      .getByLabel("Goal title")
      .fill(goalTitle);

    await page
      .getByRole("button", {
        name: "Create goal",
        exact: true,
      })
      .click();

    const goalCard = page.locator("article", {
      hasText: goalTitle,
    });

    await expect(goalCard).toBeVisible();

    await goalCard
      .getByRole("button", {
        name: "Delete goal",
      })
      .click();

    await expect(
      page.getByText(goalTitle, {
        exact: true,
      })
    ).not.toBeVisible();
  });
});
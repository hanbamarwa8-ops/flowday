import { expect, test } from "@playwright/test";

test("complete FlowDay MVP user journey", async ({
  page,
}) => {
  const email = `flow-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}@example.com`;

  //-> SIGNUP

  await page.goto("/signup");

  await expect(
    page.getByRole("heading", {
      name: "Create your account",
    })
  ).toBeVisible();

  await page
    .getByLabel("Full name")
    .fill("FlowDay E2E User");

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

  //-> GOAL

  await page.goto("/goals");

  await expect(
    page.getByRole("heading", {
      name: "Goals",
      exact: true,
    })
  ).toBeVisible();

  const goalTitle = `Journey Goal ${Date.now()}`;

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
    .fill("Goal from the complete E2E journey");

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
    goalCard.getByText("Active", {
      exact: true,
    })
  ).toBeVisible();

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

  //-> TASK

  await page.goto("/tasks");

  await expect(
    page.getByRole("heading", {
      name: "Tasks",
      exact: true,
    })
  ).toBeVisible();

  const taskTitle = `Journey Task ${Date.now()}`;

  await page
    .getByRole("button", {
      name: "New task",
      exact: true,
    })
    .click();

  await page
    .getByLabel("Task title")
    .fill(taskTitle);

  await page
    .getByLabel("Description")
    .fill("Task from the complete E2E journey");

  await page
    .getByRole("button", {
      name: "Create task",
      exact: true,
    })
    .click();

  await expect(
    page.getByText(taskTitle, {
      exact: true,
    })
  ).toBeVisible();

  await page
    .getByRole("button", {
      name: "Mark task as completed",
    })
    .click();

  await expect(
    page.getByRole("button", {
      name: "Mark task as active",
    })
  ).toBeVisible();

  //-> HABIT

  await page.goto("/habits");

  await expect(
    page.getByRole("heading", {
      name: "Habits",
      exact: true,
    })
  ).toBeVisible();

  const habitName = `Journey Habit ${Date.now()}`;

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
    .fill("Habit from the complete E2E journey");

  await page
    .getByLabel("Frequency")
    .selectOption("daily");

  await page
    .getByRole("button", {
      name: "Create habit",
      exact: true,
    })
    .click();

  await expect(
    page.getByText(habitName, {
      exact: true,
    })
  ).toBeVisible();

  await page
    .getByRole("button", {
      name: "Mark habit as completed",
    })
    .click();

  await expect(
    page.getByRole("button", {
      name: "Mark habit as incomplete",
    })
  ).toBeVisible();

  //-> FOCUS

  await page.goto("/focus");

  await expect(
    page.getByRole("heading", {
      name: "Focus",
      exact: true,
    })
  ).toBeVisible();

  await expect(
    page.getByText("25:00", {
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

  await page.waitForTimeout(1200);

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

  //-> LOGOUT

  await page
    .getByRole("button", {
      name: "Log out",
      exact: true,
    })
    .click();

  await expect(page).toHaveURL(/\/$/);
});
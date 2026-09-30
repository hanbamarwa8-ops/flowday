import {
    test,
    expect,
  } from "@playwright/test";
  
  async function createUserAndOpenTasks(
    page: import("@playwright/test").Page
  ) {
    const uniqueEmail =
      `tasks-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}@example.com`;
  
    await page.goto("/signup");
  
    await page
      .getByLabel("Full name")
      .fill("Tasks E2E User");
  
    await page
      .getByLabel("Email")
      .fill(uniqueEmail);
  
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
  
    await page.goto("/tasks");
  
    await expect(
      page.getByRole("heading", {
        name: "Tasks",
        exact: true,
      })
    ).toBeVisible();
  }
  
  test.describe("Tasks E2E", () => {
    test("user can create a task", async ({
      page,
    }) => {
      await createUserAndOpenTasks(page);
  
      const taskTitle =
        `E2E Task ${Date.now()}`;
  
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
        .fill(
          "Task created from Playwright"
        );
  
      await page
        .getByLabel("Priority")
        .selectOption("high");
  
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
  
      await expect(
        page.getByText("high", {
          exact: true,
        })
      ).toBeVisible();
    });
  
    test("user can complete a task", async ({
      page,
    }) => {
      await createUserAndOpenTasks(page);
  
      const taskTitle =
        `Complete Task ${Date.now()}`;
  
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
        .getByRole("button", {
          name: "Create task",
          exact: true,
        })
        .click();
  
      const taskContainer = page.locator(
        "div",
        {
          hasText: taskTitle,
        }
      ).first();
  
      await expect(
        taskContainer
      ).toBeVisible();
  
      await taskContainer
        .getByRole("button", {
          name: "Mark task as completed",
        })
        .click();
  
      await expect(
        taskContainer
          .getByRole("button", {
            name: "Mark task as active",
          })
      ).toBeVisible();
    });
  
    test("user can delete a task", async ({
      page,
    }) => {
      await createUserAndOpenTasks(page);
  
      const taskTitle =
        `Delete Task ${Date.now()}`;
  
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
        .getByRole("button", {
          name: "Create task",
          exact: true,
        })
        .click();
  
      const taskContainer = page.locator(
        "div",
        {
          hasText: taskTitle,
        }
      ).first();
  
      await expect(
        taskContainer
      ).toBeVisible();
  
      await taskContainer
        .getByRole("button", {
          name: "Delete task",
        })
        .click();
  
      await expect(
        page.getByText(taskTitle, {
          exact: true,
        })
      ).not.toBeVisible();
    });
  
    test("user can create a high priority task", async ({
      page,
    }) => {
      await createUserAndOpenTasks(page);
  
      const taskTitle =
        `High Priority ${Date.now()}`;
  
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
        .getByLabel("Priority")
        .selectOption("high");
  
      await page
        .getByRole("button", {
          name: "Create task",
          exact: true,
        })
        .click();
  
      const taskContainer = page.locator(
        "div",
        {
          hasText: taskTitle,
        }
      ).first();
  
      await expect(
        taskContainer
          .getByText("high", {
            exact: true,
          })
      ).toBeVisible();
    });
  });
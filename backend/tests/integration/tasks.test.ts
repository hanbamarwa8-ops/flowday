import request from "supertest";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "@jest/globals";

import type { Server } from "node:http";

import {
  clearTestDB,
  connectTestDB,
  disconnectTestDB,
} from "./mongo.setup.js";

let server: Server;

async function signup(
  agent: ReturnType<typeof request.agent>,
  name: string,
  email: string
) {
  const response = await agent
    .post("/api/auth/signup")
    .send({
      name,
      email,
      password: "password123",
    });

  expect(response.status).toBe(201);
}

beforeAll(async () => {
  await connectTestDB();

  const serverModule =
    await import("../../src/server.js");

  server = serverModule.server;
});

beforeEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

describe("Tasks integration", () => {
  test("should create a task", async () => {
    const agent = request.agent(server);

    await signup(
      agent,
      "Task User",
      "task@example.com"
    );

    const response = await agent
      .post("/api/tasks")
      .send({
        title: "Complete FlowDay tests",
        description: "Write integration tests",
        priority: "high",
      });

    expect(response.status).toBe(201);

    expect(response.body.message).toBe(
      "Task created successfully"
    );

    expect(response.body.task).toMatchObject({
      title: "Complete FlowDay tests",
      description: "Write integration tests",
      priority: "high",
      completed: false,
    });

    expect(response.body.task.userId).toBeTruthy();
  });

  test("should get only the authenticated user's tasks", async () => {
    const userA = request.agent(server);
    const userB = request.agent(server);

    await signup(
      userA,
      "User A",
      "usera@example.com"
    );

    await signup(
      userB,
      "User B",
      "userb@example.com"
    );

    await userA
      .post("/api/tasks")
      .send({
        title: "User A task",
      });

    await userB
      .post("/api/tasks")
      .send({
        title: "User B task",
      });

    const responseA = await userA.get(
      "/api/tasks"
    );

    expect(responseA.status).toBe(200);
    expect(responseA.body.tasks).toHaveLength(1);

    expect(
      responseA.body.tasks[0].title
    ).toBe("User A task");
  });

  test("should update a task", async () => {
    const agent = request.agent(server);

    await signup(
      agent,
      "Update User",
      "update@example.com"
    );

    const createResponse = await agent
      .post("/api/tasks")
      .send({
        title: "Original title",
        priority: "low",
      });

    expect(createResponse.status).toBe(201);

    const taskId =
      createResponse.body.task._id;

    const updateResponse = await agent
      .put(`/api/tasks/${taskId}`)
      .send({
        title: "Updated title",
        priority: "high",
        completed: true,
      });

    expect(updateResponse.status).toBe(200);

    expect(
      updateResponse.body.message
    ).toBe("Task updated successfully");

    expect(
      updateResponse.body.task.title
    ).toBe("Updated title");

    expect(
      updateResponse.body.task.priority
    ).toBe("high");

    expect(
      updateResponse.body.task.completed
    ).toBe(true);
  });

  test("should delete a task", async () => {
    const agent = request.agent(server);

    await signup(
      agent,
      "Delete User",
      "delete@example.com"
    );

    const createResponse = await agent
      .post("/api/tasks")
      .send({
        title: "Task to delete",
      });

    expect(createResponse.status).toBe(201);

    const taskId =
      createResponse.body.task._id;

    const deleteResponse = await agent
      .delete(`/api/tasks/${taskId}`);

    expect(deleteResponse.status).toBe(200);

    expect(
      deleteResponse.body.message
    ).toBe("Task deleted successfully");

    const getResponse = await agent.get(
      "/api/tasks"
    );

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.tasks).toHaveLength(0);
  });

  test("should not access another user's task", async () => {
    const userA = request.agent(server);
    const userB = request.agent(server);

    await signup(
      userA,
      "Owner",
      "owner@example.com"
    );

    await signup(
      userB,
      "Other User",
      "other@example.com"
    );

    const createResponse = await userA
      .post("/api/tasks")
      .send({
        title: "Private task",
      });

    expect(createResponse.status).toBe(201);

    const taskId =
      createResponse.body.task._id;

    const response = await userB.get(
      `/api/tasks/${taskId}`
    );

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      message: "Task not found",
    });
  });

  test("should reject another user's goal", async () => {
    const userA = request.agent(server);
    const userB = request.agent(server);

    await signup(
      userA,
      "Goal Owner",
      "goalowner@example.com"
    );

    await signup(
      userB,
      "Task Owner",
      "taskowner@example.com"
    );

    const goalResponse = await userA
      .post("/api/goals")
      .send({
        title: "Private goal",
      });

    expect(goalResponse.status).toBe(201);

    const goalId =
      goalResponse.body.goal._id;

    const response = await userB
      .post("/api/tasks")
      .send({
        title: "Invalid linked task",
        goalId,
      });

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      message: "Goal not found",
    });
  });

  test("should reject unauthenticated requests", async () => {
    const response = await request(server)
      .get("/api/tasks");

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      message: "Not authenticated",
    });
  });
});
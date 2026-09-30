import request from "supertest";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "@jest/globals";

import { createServer } from "node:http";

import {
  clearTestDB,
  connectTestDB,
  disconnectTestDB,
} from "./mongo.setup.js";

let server: ReturnType<typeof createServer>;
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

describe("Habits integration", () => {
  test("should create a habit", async () => {
    const agent = request.agent(server);

    await signup(
      agent,
      "Habit User",
      "habit@example.com"
    );

    const response = await agent
      .post("/api/habits")
      .send({
        name: "Read 20 minutes",
        description: "Read before sleeping",
        frequency: "daily",
      });

    expect(response.status).toBe(201);

    expect(response.body.message).toBe(
      "Habit created successfully"
    );

    expect(response.body.habit).toMatchObject({
      name: "Read 20 minutes",
      description: "Read before sleeping",
      frequency: "daily",
      completedToday: false,
      currentStreak: 0,
    });

    expect(
      response.body.habit._id
    ).toBeTruthy();

    expect(
      response.body.habit.userId
    ).toBeTruthy();
  });

  test("should get all habits for the authenticated user", async () => {
    const agent = request.agent(server);

    await signup(
      agent,
      "List User",
      "list-habit@example.com"
    );

    await agent
      .post("/api/habits")
      .send({
        name: "Exercise",
        frequency: "daily",
      });

    await agent
      .post("/api/habits")
      .send({
        name: "Study",
        frequency: "weekly",
      });

    const response = await agent.get(
      "/api/habits"
    );

    expect(response.status).toBe(200);
    expect(response.body.habits).toHaveLength(2);

    expect(
      response.body.habits.map(
        (habit: { name: string }) => habit.name
      )
    ).toEqual(
      expect.arrayContaining([
        "Exercise",
        "Study",
      ])
    );
  });

  test("should get one habit belonging to the authenticated user", async () => {
    const agent = request.agent(server);

    await signup(
      agent,
      "Single Habit User",
      "single-habit@example.com"
    );

    const createResponse = await agent
      .post("/api/habits")
      .send({
        name: "Meditation",
        frequency: "daily",
      });

    expect(createResponse.status).toBe(201);

    const habitId =
      createResponse.body.habit._id;

    const response = await agent.get(
      `/api/habits/${habitId}`
    );

    expect(response.status).toBe(200);

    expect(response.body.habit).toMatchObject({
      _id: habitId,
      name: "Meditation",
      frequency: "daily",
      completedToday: false,
      currentStreak: 0,
    });
  });

  test("should update a habit", async () => {
    const agent = request.agent(server);

    await signup(
      agent,
      "Update Habit User",
      "update-habit@example.com"
    );

    const createResponse = await agent
      .post("/api/habits")
      .send({
        name: "Original habit",
        frequency: "daily",
      });

    expect(createResponse.status).toBe(201);

    const habitId =
      createResponse.body.habit._id;

    const updateResponse = await agent
      .put(`/api/habits/${habitId}`)
      .send({
        name: "Updated habit",
        description: "Updated description",
        frequency: "weekly",
      });

    expect(updateResponse.status).toBe(200);

    expect(
      updateResponse.body.message
    ).toBe("Habit updated successfully");

    expect(updateResponse.body.habit).toMatchObject({
      _id: habitId,
      name: "Updated habit",
      description: "Updated description",
      frequency: "weekly",
    });
  });

  test("should update completion and streak", async () => {
    const agent = request.agent(server);

    await signup(
      agent,
      "Completion User",
      "completion@example.com"
    );

    const createResponse = await agent
      .post("/api/habits")
      .send({
        name: "Drink water",
        frequency: "daily",
      });

    expect(createResponse.status).toBe(201);

    const habitId =
      createResponse.body.habit._id;

    const response = await agent
      .put(`/api/habits/${habitId}`)
      .send({
        completedToday: true,
        currentStreak: 3,
      });

    expect(response.status).toBe(200);

    expect(response.body.habit).toMatchObject({
      _id: habitId,
      completedToday: true,
      currentStreak: 3,
    });
  });

  test("should reject an invalid frequency", async () => {
    const agent = request.agent(server);

    await signup(
      agent,
      "Frequency User",
      "frequency@example.com"
    );

    const response = await agent
      .post("/api/habits")
      .send({
        name: "Invalid frequency habit",
        frequency: "monthly",
      });

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      message:
        "Frequency must be daily or weekly",
    });
  });

  test("should reject an empty habit name", async () => {
    const agent = request.agent(server);

    await signup(
      agent,
      "Empty Habit User",
      "empty-habit@example.com"
    );

    const response = await agent
      .post("/api/habits")
      .send({
        name: "   ",
        frequency: "daily",
      });

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      message: "Habit name is required",
    });
  });

  test("should reject an invalid completedToday value", async () => {
    const agent = request.agent(server);

    await signup(
      agent,
      "Boolean User",
      "boolean@example.com"
    );

    const createResponse = await agent
      .post("/api/habits")
      .send({
        name: "Boolean habit",
      });

    const habitId =
      createResponse.body.habit._id;

    const response = await agent
      .put(`/api/habits/${habitId}`)
      .send({
        completedToday: "true",
      });

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      message:
        "completedToday must be a boolean",
    });
  });

  test("should reject an invalid currentStreak value", async () => {
    const agent = request.agent(server);

    await signup(
      agent,
      "Streak User",
      "streak@example.com"
    );

    const createResponse = await agent
      .post("/api/habits")
      .send({
        name: "Streak habit",
      });

    const habitId =
      createResponse.body.habit._id;

    const response = await agent
      .put(`/api/habits/${habitId}`)
      .send({
        currentStreak: -1,
      });

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      message:
        "currentStreak must be a positive integer",
    });
  });

  test("should not access another user's habit", async () => {
    const userA = request.agent(server);
    const userB = request.agent(server);

    await signup(
      userA,
      "Habit Owner",
      "habit-owner@example.com"
    );

    await signup(
      userB,
      "Other User",
      "habit-other@example.com"
    );

    const createResponse = await userA
      .post("/api/habits")
      .send({
        name: "Private habit",
      });

    expect(createResponse.status).toBe(201);

    const habitId =
      createResponse.body.habit._id;

    const response = await userB.get(
      `/api/habits/${habitId}`
    );

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      message: "Habit not found",
    });
  });

  test("should not allow another user to update a habit", async () => {
    const userA = request.agent(server);
    const userB = request.agent(server);

    await signup(
      userA,
      "Update Owner",
      "habit-update-owner@example.com"
    );

    await signup(
      userB,
      "Update Attacker",
      "habit-update-attacker@example.com"
    );

    const createResponse = await userA
      .post("/api/habits")
      .send({
        name: "Protected habit",
      });

    expect(createResponse.status).toBe(201);

    const habitId =
      createResponse.body.habit._id;

    const response = await userB
      .put(`/api/habits/${habitId}`)
      .send({
        name: "Unauthorized update",
      });

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      message: "Habit not found",
    });
  });

  test("should not allow another user to delete a habit", async () => {
    const userA = request.agent(server);
    const userB = request.agent(server);

    await signup(
      userA,
      "Delete Owner",
      "habit-delete-owner@example.com"
    );

    await signup(
      userB,
      "Delete Attacker",
      "habit-delete-attacker@example.com"
    );

    const createResponse = await userA
      .post("/api/habits")
      .send({
        name: "Protected delete habit",
      });

    expect(createResponse.status).toBe(201);

    const habitId =
      createResponse.body.habit._id;

    const response = await userB.delete(
      `/api/habits/${habitId}`
    );

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      message: "Habit not found",
    });

    const ownerResponse =
      await userA.get(
        `/api/habits/${habitId}`
      );

    expect(ownerResponse.status).toBe(200);
  });

  test("should delete a habit", async () => {
    const agent = request.agent(server);

    await signup(
      agent,
      "Delete Habit User",
      "real-delete-habit@example.com"
    );

    const createResponse = await agent
      .post("/api/habits")
      .send({
        name: "Habit to delete",
      });

    expect(createResponse.status).toBe(201);

    const habitId =
      createResponse.body.habit._id;

    const deleteResponse =
      await agent.delete(
        `/api/habits/${habitId}`
      );

    expect(deleteResponse.status).toBe(200);

    expect(
      deleteResponse.body.message
    ).toBe("Habit deleted successfully");

    const getResponse = await agent.get(
      `/api/habits/${habitId}`
    );

    expect(getResponse.status).toBe(404);

    expect(getResponse.body).toEqual({
      message: "Habit not found",
    });
  });

  test("should reject unauthenticated requests", async () => {
    const response = await request(server)
      .get("/api/habits");

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      message: "Not authenticated",
    });
  });
});
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

describe("Goals integration", () => {
  test("should create a goal", async () => {
    const agent = request.agent(server);

    await signup(
      agent,
      "Goal User",
      "goal@example.com"
    );

    const response = await agent
      .post("/api/goals")
      .send({
        title: "Complete FlowDay",
        description: "Finish the MVP",
        targetDate: "2026-12-31",
      });

    expect(response.status).toBe(201);

    expect(response.body.message).toBe(
      "Goal created successfully"
    );

    expect(response.body.goal).toMatchObject({
      title: "Complete FlowDay",
      description: "Finish the MVP",
      status: "active",
    });

    expect(
      response.body.goal._id
    ).toBeTruthy();

    expect(
      response.body.goal.userId
    ).toBeTruthy();

    expect(
      response.body.goal.targetDate
    ).toBeTruthy();
  });

  test("should get only the authenticated user's goals", async () => {
    const userA = request.agent(server);
    const userB = request.agent(server);

    await signup(
      userA,
      "User A",
      "goala@example.com"
    );

    await signup(
      userB,
      "User B",
      "goalb@example.com"
    );

    await userA
      .post("/api/goals")
      .send({
        title: "User A goal",
      });

    await userB
      .post("/api/goals")
      .send({
        title: "User B goal",
      });

    const responseA = await userA.get(
      "/api/goals"
    );

    expect(responseA.status).toBe(200);
    expect(responseA.body.goals).toHaveLength(1);

    expect(
      responseA.body.goals[0].title
    ).toBe("User A goal");
  });

  test("should get one goal belonging to the authenticated user", async () => {
    const agent = request.agent(server);

    await signup(
      agent,
      "Single Goal User",
      "singlegoal@example.com"
    );

    const createResponse = await agent
      .post("/api/goals")
      .send({
        title: "My personal goal",
      });

    expect(createResponse.status).toBe(201);

    const goalId =
      createResponse.body.goal._id;

    const response = await agent.get(
      `/api/goals/${goalId}`
    );

    expect(response.status).toBe(200);

    expect(response.body.goal).toMatchObject({
      _id: goalId,
      title: "My personal goal",
      status: "active",
    });
  });

  test("should not access another user's goal", async () => {
    const userA = request.agent(server);
    const userB = request.agent(server);

    await signup(
      userA,
      "Goal Owner",
      "ownergoal@example.com"
    );

    await signup(
      userB,
      "Other User",
      "othergoal@example.com"
    );

    const createResponse = await userA
      .post("/api/goals")
      .send({
        title: "Private goal",
      });

    expect(createResponse.status).toBe(201);

    const goalId =
      createResponse.body.goal._id;

    const response = await userB.get(
      `/api/goals/${goalId}`
    );

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      message: "Goal not found",
    });
  });

  test("should update a goal", async () => {
    const agent = request.agent(server);

    await signup(
      agent,
      "Update Goal User",
      "updategoal@example.com"
    );

    const createResponse = await agent
      .post("/api/goals")
      .send({
        title: "Original goal",
        description: "Original description",
      });

    expect(createResponse.status).toBe(201);

    const goalId =
      createResponse.body.goal._id;

    const updateResponse = await agent
      .put(`/api/goals/${goalId}`)
      .send({
        title: "Updated goal",
        description: "Updated description",
        status: "completed",
        targetDate: "2027-01-15",
      });

    expect(updateResponse.status).toBe(200);

    expect(
      updateResponse.body.message
    ).toBe("Goal updated successfully");

    expect(updateResponse.body.goal).toMatchObject({
      _id: goalId,
      title: "Updated goal",
      description: "Updated description",
      status: "completed",
    });

    expect(
      updateResponse.body.goal.targetDate
    ).toBeTruthy();
  });

  test("should reject an invalid goal status", async () => {
    const agent = request.agent(server);

    await signup(
      agent,
      "Invalid Status User",
      "invalidstatus@example.com"
    );

    const createResponse = await agent
      .post("/api/goals")
      .send({
        title: "Goal to update",
      });

    expect(createResponse.status).toBe(201);

    const goalId =
      createResponse.body.goal._id;

    const response = await agent
      .put(`/api/goals/${goalId}`)
      .send({
        status: "invalid-status",
      });

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      message: "Invalid goal status",
    });
  });

  test("should reject an invalid target date", async () => {
    const agent = request.agent(server);

    await signup(
      agent,
      "Invalid Date User",
      "invaliddate@example.com"
    );

    const response = await agent
      .post("/api/goals")
      .send({
        title: "Invalid date goal",
        targetDate: "not-a-real-date",
      });

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      message: "Invalid target date",
    });
  });

  test("should reject an empty goal title", async () => {
    const agent = request.agent(server);

    await signup(
      agent,
      "Empty Goal User",
      "emptygoal@example.com"
    );

    const response = await agent
      .post("/api/goals")
      .send({
        title: "   ",
      });

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      message: "Goal title is required",
    });
  });

  test("should not allow another user to update a goal", async () => {
    const userA = request.agent(server);
    const userB = request.agent(server);

    await signup(
      userA,
      "Owner",
      "updateowner@example.com"
    );

    await signup(
      userB,
      "Attacker",
      "updateattacker@example.com"
    );

    const createResponse = await userA
      .post("/api/goals")
      .send({
        title: "Protected goal",
      });

    expect(createResponse.status).toBe(201);

    const goalId =
      createResponse.body.goal._id;

    const response = await userB
      .put(`/api/goals/${goalId}`)
      .send({
        title: "Unauthorized update",
      });

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      message: "Goal not found",
    });
  });

  test("should not allow another user to delete a goal", async () => {
    const userA = request.agent(server);
    const userB = request.agent(server);

    await signup(
      userA,
      "Delete Owner",
      "deleteowner@example.com"
    );

    await signup(
      userB,
      "Delete Attacker",
      "deleteattacker@example.com"
    );

    const createResponse = await userA
      .post("/api/goals")
      .send({
        title: "Protected delete goal",
      });

    expect(createResponse.status).toBe(201);

    const goalId =
      createResponse.body.goal._id;

    const response = await userB.delete(
      `/api/goals/${goalId}`
    );

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      message: "Goal not found",
    });

    const ownerResponse =
      await userA.get(
        `/api/goals/${goalId}`
      );

    expect(ownerResponse.status).toBe(200);
  });

  test("should delete a goal", async () => {
    const agent = request.agent(server);

    await signup(
      agent,
      "Delete Goal User",
      "realdelete@example.com"
    );

    const createResponse = await agent
      .post("/api/goals")
      .send({
        title: "Goal to delete",
      });

    expect(createResponse.status).toBe(201);

    const goalId =
      createResponse.body.goal._id;

    const deleteResponse =
      await agent.delete(
        `/api/goals/${goalId}`
      );

    expect(deleteResponse.status).toBe(200);

    expect(
      deleteResponse.body.message
    ).toBe("Goal deleted successfully");

    const getResponse = await agent.get(
      `/api/goals/${goalId}`
    );

    expect(getResponse.status).toBe(404);

    expect(getResponse.body).toEqual({
      message: "Goal not found",
    });
  });

  test("should reject unauthenticated requests", async () => {
    const response = await request(server)
      .get("/api/goals");

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      message: "Not authenticated",
    });
  });
});
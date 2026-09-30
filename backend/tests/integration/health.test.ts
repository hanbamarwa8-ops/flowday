import request from "supertest";
import { describe, expect, test } from "@jest/globals";

import { server } from "../../src/server.js";

describe("Health endpoint", () => {
  test("GET /api/health should return API status", async () => {
    const response = await request(server)
      .get("/api/health");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      status: "ok",
      service: "flowday-backend",
    });
  });
});
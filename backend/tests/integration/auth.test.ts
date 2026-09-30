import request from "supertest";
import type { Server } from "node:http";

import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "@jest/globals";

import User from "../../src/models/User.js";

import {
  clearTestDB,
  connectTestDB,
  disconnectTestDB,
} from "./mongo.setup.js";

let server: Server;

beforeAll(async () => {
  await connectTestDB();

  // Import after MONGODB_URI has been replaced
  // by the MongoMemoryServer URI.
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


describe("Authentication integration", () => {
  test("should signup, access /me and logout", async () => {
    const agent = request.agent(server);

    const signupResponse = await agent
      .post("/api/auth/signup")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

    expect(signupResponse.status).toBe(201);

    expect(
      signupResponse.body.message
    ).toBe("Account created successfully");

    expect(
      signupResponse.body.user
    ).toEqual({
      id: expect.any(String),
      name: "Test User",
      email: "test@example.com",
    });

    expect(
      signupResponse.body.user
    ).not.toHaveProperty("password");

    expect(
      signupResponse.headers["set-cookie"]
    ).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          "authToken="
        ),
      ])
    );


    // /me

    const meResponse = await agent
      .get("/api/auth/me");

    expect(meResponse.status).toBe(200);

    expect(meResponse.body.user).toEqual({
      id: expect.any(String),
      name: "Test User",
      email: "test@example.com",
    });


    // logout

    const logoutResponse = await agent
      .post("/api/auth/logout");

    expect(logoutResponse.status).toBe(200);

    expect(
      logoutResponse.body.message
    ).toBe("Logout successful");


    // /me after logout

    const meAfterLogout =
      await agent.get("/api/auth/me");

    expect(
      meAfterLogout.status
    ).toBe(401);
  });


  test("should login with valid credentials", async () => {
    const signupResponse = await request(
      server
    )
      .post("/api/auth/signup")
      .send({
        name: "Login User",
        email: "login@example.com",
        password: "password123",
      });

    expect(signupResponse.status).toBe(201);

    const loginResponse = await request(
      server
    )
      .post("/api/auth/login")
      .send({
        email: "login@example.com",
        password: "password123",
      });

    expect(loginResponse.status).toBe(200);

    expect(
      loginResponse.body.message
    ).toBe("Login successful");

    expect(
      loginResponse.body.user
    ).toEqual({
      id: expect.any(String),
      name: "Login User",
      email: "login@example.com",
    });

    expect(
      loginResponse.headers["set-cookie"]
    ).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          "authToken="
        ),
      ])
    );
  });


  test("should reject invalid login credentials", async () => {
    await request(server)
      .post("/api/auth/signup")
      .send({
        name: "Invalid Login User",
        email: "invalid@example.com",
        password: "password123",
      });

    const response = await request(server)
      .post("/api/auth/login")
      .send({
        email: "invalid@example.com",
        password: "wrongpassword",
      });

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      message:
        "Invalid email or password",
    });
  });


  test("should reject duplicate email signup", async () => {
    await request(server)
      .post("/api/auth/signup")
      .send({
        name: "First User",
        email: "duplicate@example.com",
        password: "password123",
      });

    const response = await request(server)
      .post("/api/auth/signup")
      .send({
        name: "Second User",
        email: "duplicate@example.com",
        password: "password123",
      });

    expect(response.status).toBe(409);

    expect(response.body).toEqual({
      message:
        "An account with this email already exists",
    });
  });


  test("should reject a password shorter than 8 characters", async () => {
    const response = await request(server)
      .post("/api/auth/signup")
      .send({
        name: "Short Password",
        email: "short@example.com",
        password: "1234567",
      });

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      message:
        "Password must contain at least 8 characters",
    });

    const user = await User.findOne({
      email: "short@example.com",
    });

    expect(user).toBeNull();
  });
});
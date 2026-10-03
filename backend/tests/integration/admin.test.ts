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

// TEST SETUP

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

// HELPERS

function getAuthCookies(
  response: request.Response
): string[] {
  const rawCookies =
    response.headers["set-cookie"];

  if (!rawCookies) {
    throw new Error(
      "No Set-Cookie header found"
    );
  }

  return Array.isArray(rawCookies)
    ? rawCookies
    : [rawCookies];
}

async function createUser(
  name: string,
  email: string,
  password = "password123"
): Promise<{
  userId: string;
  cookies: string[];
}> {
  const response = await request(server)
    .post("/api/auth/signup")
    .send({
      name,
      email,
      password,
    });

  expect(response.status).toBe(201);

  return {
    userId: response.body.user.id,
    cookies: getAuthCookies(response),
  };
}

async function makeUserAdmin(
  userId: string
) {
  await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        role: "ADMIN",
      },
    }
  );
}

//-> RBAC INTEGRATION TESTS

describe("RBAC integration", () => {

  // USER CANNOT SEE USERS

  test(
    "USER should not access the admin users list",
    async () => {
      const user =
        await createUser(
          "Normal User",
          "user@example.com"
        );

      const response =
        await request(server)
          .get("/api/admin/users")
          .set("Cookie", user.cookies);

      expect(response.status).toBe(403);

      expect(response.body).toEqual({
        message:
          "You do not have permission to access this resource",
      });
    }
  );

  //-> ADMIN CAN SEE USERS

  test(
    "ADMIN should access the admin users list",
    async () => {
      const admin =
        await createUser(
          "Admin User",
          "admin@example.com"
        );

      await makeUserAdmin(
        admin.userId
      );

      const normalUser =
        await createUser(
          "Normal User",
          "user@example.com"
        );

      const response =
        await request(server)
          .get("/api/admin/users")
          .set("Cookie", admin.cookies);

      expect(response.status).toBe(200);

      expect(
        response.body.users
      ).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            _id: admin.userId,
            name: "Admin User",
            email: "admin@example.com",
            role: "ADMIN",
          }),
          expect.objectContaining({
            _id: normalUser.userId,
            name: "Normal User",
            email: "user@example.com",
            role: "USER",
          }),
        ])
      );

      // Sensitive fields must not be returned.
      for (const user of response.body.users) {
        expect(user.password).toBeUndefined();
        expect(user.resetToken).toBeUndefined();
        expect(
          user.resetTokenExpires
        ).toBeUndefined();
      }
    }
  );

  //->USER CANNOT DELETE

  test(
    "USER should not delete another user",
    async () => {
      const normalUser =
        await createUser(
          "Normal User",
          "user@example.com"
        );

      const targetUser =
        await createUser(
          "Target User",
          "target@example.com"
        );

      const response =
        await request(server)
          .delete(
            `/api/admin/users/${targetUser.userId}`
          )
          .set(
            "Cookie",
            normalUser.cookies
          );

      expect(response.status).toBe(403);

      const targetStillExists =
        await User.findById(
          targetUser.userId
        );

      expect(
        targetStillExists
      ).not.toBeNull();
    }
  );

  //-> ADMIN CAN DELETE

  test(
    "ADMIN should delete another user",
    async () => {
      const admin =
        await createUser(
          "Admin User",
          "admin@example.com"
        );

      await makeUserAdmin(
        admin.userId
      );

      const targetUser =
        await createUser(
          "Target User",
          "target@example.com"
        );

      const response =
        await request(server)
          .delete(
            `/api/admin/users/${targetUser.userId}`
          )
          .set("Cookie", admin.cookies);

      expect(response.status).toBe(200);

      expect(response.body).toEqual({
        message:
          "User deleted successfully",
      });

      const deletedUser =
        await User.findById(
          targetUser.userId
        );

      expect(deletedUser).toBeNull();

      // The deleted user should no longer be able to login.
      const loginResponse =
        await request(server)
          .post("/api/auth/login")
          .send({
            email: "target@example.com",
            password: "password123",
          });

      expect(loginResponse.status).toBe(401);
    }
  );

  // ADMIN CANNOT DELETE ITSELF

  test(
    "ADMIN should not delete their own account",
    async () => {
      const admin =
        await createUser(
          "Admin User",
          "admin@example.com"
        );

      await makeUserAdmin(
        admin.userId
      );

      const response =
        await request(server)
          .delete(
            `/api/admin/users/${admin.userId}`
          )
          .set("Cookie", admin.cookies);

      expect(response.status).toBe(400);

      expect(response.body).toEqual({
        message:
          "You cannot delete your own admin account",
      });

      const adminStillExists =
        await User.findById(
          admin.userId
        );

      expect(
        adminStillExists
      ).not.toBeNull();
    }
  );
});
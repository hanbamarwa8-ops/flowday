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
import RefreshToken from "../../src/models/RefreshToken.js";

import {
  hashRefreshToken,
} from "../../src/lib/refresh-tokens.js";

import {
  clearTestDB,
  connectTestDB,
  disconnectTestDB,
} from "./mongo.setup.js";

let server: Server;



// TEST SETUP

beforeAll(async () => {
  await connectTestDB();

  // Import after MONGODB_URI has been replaced  by the MongoMemoryServer URI.
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

function getCookieValue(
  response: request.Response,
  cookieName: string
): string {

  const rawCookies =
    response.headers["set-cookie"];

  if (!rawCookies) {
    throw new Error(
      `No Set-Cookie header found for ${cookieName}`
    );
  }

  const cookies: string[] =
    Array.isArray(rawCookies)
      ? rawCookies
      : [rawCookies];

  const cookie =
    cookies.find(
      (value) =>
        value.startsWith(
          `${cookieName}=`
        )
    );

  if (!cookie) {
    throw new Error(
      `Cookie ${cookieName} was not found`
    );
  }

  const value =
    cookie
      .split(";")[0]
      .slice(
        cookieName.length + 1
      );

  return decodeURIComponent(value);
}


function expectAuthCookies(
  response: request.Response
) {

  expect(
    response.headers["set-cookie"]
  ).toEqual(
    expect.arrayContaining([
      expect.stringContaining(
        "authToken="
      ),
      expect.stringContaining(
        "refreshToken="
      ),
    ])
  );
}


// AUTHENTICATION INTEGRATION

describe(
  "Authentication integration",
  () => {

    // SIGNUP / ME / LOGOUT

    test(
      "should signup, access /me and logout",
      async () => {

        const agent =
          request.agent(server);

        const signupResponse =
          await agent
            .post(
              "/api/auth/signup"
            )
            .send({
              name: "Test User",
              email:
                "test@example.com",
              password:
                "password123",
            });

        expect(
          signupResponse.status
        ).toBe(201);

        expect(
          signupResponse.body.message
        ).toBe(
          "Account created successfully"
        );

        expect(
          signupResponse.body.user
        ).toEqual({
          id: expect.any(String),
          name: "Test User",
          email: "test@example.com",
        });

        expect(
          signupResponse.body.user
        ).not.toHaveProperty(
          "password"
        );

        expectAuthCookies(
          signupResponse
        );

        const refreshToken =
          getCookieValue(
            signupResponse,
            "refreshToken"
          );

        expect(
          refreshToken
        ).toBeTruthy();


        // /me

        const meResponse =
          await agent
            .get(
              "/api/auth/me"
            );

        expect(
          meResponse.status
        ).toBe(200);

        expect(
          meResponse.body.user
        ).toEqual({
          id: expect.any(String),
          name: "Test User",
          email: "test@example.com",
        });


        // logout

        const logoutResponse =
          await agent
            .post(
              "/api/auth/logout"
            );

        expect(
          logoutResponse.status
        ).toBe(200);

        expect(
          logoutResponse.body.message
        ).toBe(
          "Logout successful"
        );


        // /me after logout

        const meAfterLogout =
          await agent
            .get(
              "/api/auth/me"
            );

        expect(
          meAfterLogout.status
        ).toBe(401);


        // refresh token after logout

        const refreshAfterLogout =
          await request(server)
            .post(
              "/api/auth/refresh"
            )
            .set(
              "Cookie",
              `refreshToken=${encodeURIComponent(
                refreshToken
              )}`
            );

        expect(
          refreshAfterLogout.status
        ).toBe(401);
      }
    );


    // LOGIN

    test(
      "should login with valid credentials",
      async () => {

        const signupResponse =
          await request(server)
            .post(
              "/api/auth/signup"
            )
            .send({
              name:
                "Login User",
              email:
                "login@example.com",
              password:
                "password123",
            });

        expect(
          signupResponse.status
        ).toBe(201);


        const loginResponse =
          await request(server)
            .post(
              "/api/auth/login"
            )
            .send({
              email:
                "login@example.com",
              password:
                "password123",
            });

        expect(
          loginResponse.status
        ).toBe(200);

        expect(
          loginResponse.body.message
        ).toBe(
          "Login successful"
        );

        expect(
          loginResponse.body.user
        ).toEqual({
          id: expect.any(String),
          name: "Login User",
          email:
            "login@example.com",
        });

        expectAuthCookies(
          loginResponse
        );
      }
    );


    // INVALID LOGIN

    test(
      "should reject invalid login credentials",
      async () => {

        await request(server)
          .post(
            "/api/auth/signup"
          )
          .send({
            name:
              "Invalid Login User",
            email:
              "invalid@example.com",
            password:
              "password123",
          });

        const response =
          await request(server)
            .post(
              "/api/auth/login"
            )
            .send({
              email:
                "invalid@example.com",
              password:
                "wrongpassword",
            });

        expect(
          response.status
        ).toBe(401);

        expect(
          response.body
        ).toEqual({
          message:
            "Invalid email or password",
        });
      }
    );


    // DUPLICATE EMAIL

    test(
      "should reject duplicate email signup",
      async () => {

        await request(server)
          .post(
            "/api/auth/signup"
          )
          .send({
            name:
              "First User",
            email:
              "duplicate@example.com",
            password:
              "password123",
          });

        const response =
          await request(server)
            .post(
              "/api/auth/signup"
            )
            .send({
              name:
                "Second User",
              email:
                "duplicate@example.com",
              password:
                "password123",
            });

        expect(
          response.status
        ).toBe(409);

        expect(
          response.body
        ).toEqual({
          message:
            "An account with this email already exists",
        });
      }
    );


    // SHORT PASSWORD

    test(
      "should reject a password shorter than 8 characters",
      async () => {

        const response =
          await request(server)
            .post(
              "/api/auth/signup"
            )
            .send({
              name:
                "Short Password",
              email:
                "short@example.com",
              password:
                "1234567",
            });

        expect(
          response.status
        ).toBe(400);

        expect(
          response.body
        ).toEqual({
          message:
            "Password must contain at least 8 characters",
        });

        const user =
          await User.findOne({
            email:
              "short@example.com",
          });

        expect(user)
          .toBeNull();
      }
    );


    // REFRESH TOKEN ROTATION

    test(
      "should refresh and rotate the refresh token",
      async () => {

        const agent =
          request.agent(server);


        const signupResponse =
          await agent
            .post(
              "/api/auth/signup"
            )
            .send({
              name:
                "Refresh User",
              email:
                "refresh@example.com",
              password:
                "password123",
            });

        expect(
          signupResponse.status
        ).toBe(201);


        const oldRefreshToken =
          getCookieValue(
            signupResponse,
            "refreshToken"
          );


        const oldTokenHash =
          hashRefreshToken(
            oldRefreshToken
          );


        const storedOldToken =
          await RefreshToken.findOne({
            tokenHash:
              oldTokenHash,
          });

        expect(
          storedOldToken
        ).not.toBeNull();

        expect(
          storedOldToken?.revokedAt
        ).toBeNull();


        // REFRESH

        const refreshResponse =
          await agent
            .post(
              "/api/auth/refresh"
            );

        expect(
          refreshResponse.status
        ).toBe(200);

        expect(
          refreshResponse.body
        ).toEqual({
          message:
            "Token refreshed",
        });

        expectAuthCookies(
          refreshResponse
        );


        const newRefreshToken =
          getCookieValue(
            refreshResponse,
            "refreshToken"
          );

        expect(
          newRefreshToken
        ).toBeTruthy();

        expect(
          newRefreshToken
        ).not.toBe(
          oldRefreshToken
        );


        // OLD TOKEN MUST BE REVOKED

        const updatedOldToken =
          await RefreshToken.findOne({
            tokenHash:
              oldTokenHash,
          });

        expect(
          updatedOldToken
        ).not.toBeNull();

        expect(
          updatedOldToken?.revokedAt
        ).not.toBeNull();

        expect(
          updatedOldToken?.replacedByTokenHash
        ).toBe(
          hashRefreshToken(
            newRefreshToken
          )
        );


        // NEW TOKEN MUST WORK

        const meResponse =
          await agent
            .get(
              "/api/auth/me"
            );

        expect(
          meResponse.status
        ).toBe(200);
      }
    );


    // MISSING REFRESH TOKEN

    test(
      "should reject refresh when the refresh token is missing",
      async () => {

        const response =
          await request(server)
            .post(
              "/api/auth/refresh"
            );

        expect(
          response.status
        ).toBe(401);

        expect(
          response.body
        ).toEqual({
          message:
            "Refresh token is required",
        });
      }
    );


    // INVALID REFRESH TOKEN

    test(
      "should reject an invalid refresh token",
      async () => {

        const response =
          await request(server)
            .post(
              "/api/auth/refresh"
            )
            .set(
              "Cookie",
              "refreshToken=invalid-refresh-token"
            );

        expect(
          response.status
        ).toBe(401);

        expect(
          response.body
        ).toEqual({
          message:
            "Invalid refresh token",
        });
      }
    );



    // EXPIRED REFRESH TOKEN

    test(
      "should reject an expired refresh token",
      async () => {

        const agent =
          request.agent(server);


        const signupResponse =
          await agent
            .post(
              "/api/auth/signup"
            )
            .send({
              name:
                "Expired User",
              email:
                "expired@example.com",
              password:
                "password123",
            });

        expect(
          signupResponse.status
        ).toBe(201);


        const refreshToken =
          getCookieValue(
            signupResponse,
            "refreshToken"
          );


        const tokenHash =
          hashRefreshToken(
            refreshToken
          );


        await RefreshToken.findOneAndUpdate(
          {
            tokenHash,
          },
          {
            $set: {
              expiresAt:
                new Date(
                  Date.now() - 1000
                ),
            },
          },
          {
            returnDocument:
              "after",
          }
        );


        const refreshResponse =
          await agent
            .post(
              "/api/auth/refresh"
            );

        expect(
          refreshResponse.status
        ).toBe(401);

        expect(
          refreshResponse.body
        ).toEqual({
          message:
            "Refresh token has expired",
        });
      }
    );


    // REFRESH TOKEN REUSE DETECTION

    test(
      "should revoke the whole token family when an old refresh token is reused",
      async () => {

        const agent =
          request.agent(server);


        const signupResponse =
          await agent
            .post(
              "/api/auth/signup"
            )
            .send({
              name:
                "Reuse User",
              email:
                "reuse@example.com",
              password:
                "password123",
            });

        expect(
          signupResponse.status
        ).toBe(201);


        const oldRefreshToken =
          getCookieValue(
            signupResponse,
            "refreshToken"
          );


        const oldTokenHash =
          hashRefreshToken(
            oldRefreshToken
          );


        // FIRST ROTATION

        const firstRefresh =
          await agent
            .post(
              "/api/auth/refresh"
            );

        expect(
          firstRefresh.status
        ).toBe(200);


        const newRefreshToken =
          getCookieValue(
            firstRefresh,
            "refreshToken"
          );

        expect(
          newRefreshToken
        ).not.toBe(
          oldRefreshToken
        );


        // REUSE OLD TOKEN

        const reuseResponse =
          await request(server)
            .post(
              "/api/auth/refresh"
            )
            .set(
              "Cookie",
              `refreshToken=${encodeURIComponent(
                oldRefreshToken
              )}`
            );

        expect(
          reuseResponse.status
        ).toBe(401);

        expect(
          reuseResponse.body
        ).toEqual({
          message:
            "Refresh token has been revoked",
        });


        // WHOLE FAMILY MUST BE REVOKED

        const oldStoredToken =
          await RefreshToken.findOne({
            tokenHash:
              oldTokenHash,
          });

        expect(
          oldStoredToken
        ).not.toBeNull();


        const familyId =
          oldStoredToken?.familyId;

        expect(
          familyId
        ).toBeTruthy();


        const familyTokens =
          await RefreshToken.find({
            familyId,
          });

        expect(
          familyTokens.length
        ).toBeGreaterThanOrEqual(2);


        for (
          const token of familyTokens
        ) {
          expect(
            token.revokedAt
          ).not.toBeNull();
        }


        // NEW TOKEN MUST ALSO BE INVALID

        const familyReuseResponse =
          await request(server)
            .post(
              "/api/auth/refresh"
            )
            .set(
              "Cookie",
              `refreshToken=${encodeURIComponent(
                newRefreshToken
              )}`
            );

        expect(
          familyReuseResponse.status
        ).toBe(401);

        expect(
          familyReuseResponse.body
        ).toEqual({
          message:
            "Refresh token has been revoked",
        });
      }
    );


    // REFRESH TOKEN CANNOT BE USED AS ACCESS TOKEN

    test(
      "should reject a refresh token used as an access token",
      async () => {

        const signupResponse =
          await request(server)
            .post(
              "/api/auth/signup"
            )
            .send({
              name:
                "Wrong Token User",
              email:
                "wrong-token@example.com",
              password:
                "password123",
            });

        expect(
          signupResponse.status
        ).toBe(201);


        const refreshToken =
          getCookieValue(
            signupResponse,
            "refreshToken"
          );


        const response =
          await request(server)
            .get(
              "/api/auth/me"
            )
            .set(
              "Cookie",
              `authToken=${encodeURIComponent(
                refreshToken
              )}`
            );


        expect(
          response.status
        ).toBe(401);


        expect(
          response.body.message
        ).toBe(
          "Invalid or expired access token"
        );
      }
    );

  }
);

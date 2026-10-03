import {
  describe,
  expect,
  test,
} from "@jest/globals";

import jwt from "jsonwebtoken";

import {
  generateAccessToken,
  verifyAccessToken,
} from "../../src/lib/jwt.js";


describe("JWT utilities", () => {

  const userId =
    "507f1f77bcf86cd799439011";


  // GENERATE ACCESS TOKEN

  test("should generate and verify a valid access token", () => {

    const token =
      generateAccessToken(userId);


    const payload =
      verifyAccessToken(token);


    expect(token).toBeTruthy();

    expect(payload).not.toBeNull();

    expect(payload?.userId)
      .toBe(userId);

    expect(payload?.tokenType)
      .toBe("access");
  });


  // INVALID TOKEN

  test("should reject an invalid token", () => {

    const payload =
      verifyAccessToken(
        "invalid-token"
      );


    expect(payload).toBeNull();
  });


  // REFRESH / WRONG TOKEN TYPE

  test("should reject a token without access token type", () => {

    const secret =
      process.env.JWT_SECRET;


    expect(secret).toBeTruthy();


    const token =
      jwt.sign(
        {
          userId,
        },
        secret as string,
        {
          expiresIn: "15m",
        }
      );


    const payload =
      verifyAccessToken(token);


    expect(payload).toBeNull();
  });


  // WRONG TOKEN TYPE

  test("should reject a token with a different token type", () => {

    const secret =
      process.env.JWT_SECRET;


    expect(secret).toBeTruthy();


    const token =
      jwt.sign(
        {
          userId,
          tokenType: "refresh",
        },
        secret as string,
        {
          expiresIn: "15m",
        }
      );


    const payload =
      verifyAccessToken(token);


    expect(payload).toBeNull();
  });

});
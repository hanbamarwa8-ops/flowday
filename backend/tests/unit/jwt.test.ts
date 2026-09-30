import { describe, expect, test } from "@jest/globals";
import {
  generateToken,
  verifyToken,
} from "../../src/lib/jwt.js";

describe("JWT utilities", () => {
  test("should generate and verify a valid token", () => {
    const userId = "507f1f77bcf86cd799439011";

    const token = generateToken(userId);
    const payload = verifyToken(token);

    expect(token).toBeTruthy();
    expect(payload).not.toBeNull();
    expect(payload?.userId).toBe(userId);
  });

  test("should reject an invalid token", () => {
    const payload = verifyToken("invalid-token");

    expect(payload).toBeNull();
  });
});
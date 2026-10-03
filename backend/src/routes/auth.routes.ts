import type {
  IncomingMessage,
  ServerResponse,
} from "node:http";

import crypto from "node:crypto";
import bcrypt from "bcryptjs";

import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";

import {
  generateAccessToken,
  verifyAccessToken,
} from "../lib/jwt.js";

import {
  getAuthToken,
  setAuthCookie,
  clearAuthCookie,
  getRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} from "../lib/cookies.js";

import {
  createStoredRefreshToken,
  hashRefreshToken,
  rotateStoredRefreshToken,
  revokeRefreshToken,
  revokeRefreshTokenFamily,
} from "../lib/refresh-tokens.js";

import { sendResetEmail } from "../lib/email.js";


// READ JSON BODY

async function readBody(
  req: IncomingMessage
) {
  return new Promise<Record<string, unknown>>(
    (resolve, reject) => {
      let body = "";

      req.on("data", (chunk) => {
        body += chunk.toString();
      });

      req.on("end", () => {
        try {
          if (!body) {
            resolve({});
            return;
          }

          resolve(JSON.parse(body));
        } catch {
          reject(new Error("Invalid JSON"));
        }
      });

      req.on("error", reject);
    }
  );
}


// SEND JSON

function sendJson(
  res: ServerResponse,
  statusCode: number,
  data: unknown
) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
  });

  res.end(JSON.stringify(data));
}


// CREATE AUTH SESSION

async function createSession(
  res: ServerResponse,
  userId: string
) {
  const accessToken =
    generateAccessToken(userId);

  const {
    token: refreshToken,
  } = await createStoredRefreshToken(
    userId
  );

  setAuthCookie(
    res,
    accessToken
  );

  setRefreshTokenCookie(
    res,
    refreshToken
  );
}


// AUTH ROUTER

export async function authRouter(
  req: IncomingMessage,
  res: ServerResponse
): Promise<boolean> {

  const method = req.method;
  const url = req.url || "";


  // SIGNUP

  if (
    method === "POST" &&
    url === "/api/auth/signup"
  ) {
    try {

      const body = await readBody(req);

      const name = body.name;
      const email = body.email;
      const password = body.password;


      if (
        typeof name !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string"
      ) {
        sendJson(res, 400, {
          message:
            "Name, email and password are required",
        });

        return true;
      }


      if (password.length < 8) {
        sendJson(res, 400, {
          message:
            "Password must contain at least 8 characters",
        });

        return true;
      }


      const normalizedEmail =
        email.trim().toLowerCase();


      const existingUser =
        await User.findOne({
          email: normalizedEmail,
        });


      if (existingUser) {
        sendJson(res, 409, {
          message:
            "An account with this email already exists",
        });

        return true;
      }


      const hashedPassword =
        await bcrypt.hash(
          password,
          12
        );


      const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
      });


      await createSession(
        res,
        user._id.toString()
      );


      sendJson(res, 201, {
        message:
          "Account created successfully",

        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        },
      });


      return true;

    } catch (error) {

      console.error(
        "Signup error:",
        error
      );

      sendJson(res, 500, {
        message:
          "Unable to create account",
      });

      return true;
    }
  }


  // LOGIN

  if (
    method === "POST" &&
    url === "/api/auth/login"
  ) {
    try {

      const body = await readBody(req);

      const email = body.email;
      const password = body.password;


      if (
        typeof email !== "string" ||
        typeof password !== "string"
      ) {
        sendJson(res, 400, {
          message:
            "Email and password are required",
        });

        return true;
      }


      const normalizedEmail =
        email.trim().toLowerCase();


      const user =
        await User.findOne({
          email: normalizedEmail,
        });


      if (!user) {
        sendJson(res, 401, {
          message:
            "Invalid email or password",
        });

        return true;
      }


      const passwordMatches =
        await bcrypt.compare(
          password,
          user.password
        );


      if (!passwordMatches) {
        sendJson(res, 401, {
          message:
            "Invalid email or password",
        });

        return true;
      }


      await createSession(
        res,
        user._id.toString()
      );


      sendJson(res, 200, {
        message:
          "Login successful",

        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        },
      });


      return true;

    } catch (error) {

      console.error(
        "Login error:",
        error
      );

      sendJson(res, 500, {
        message:
          "Unable to login",
      });

      return true;
    }
  }


  // ME


  if (
    method === "GET" &&
    url === "/api/auth/me"
  ) {
    try {

      const token =
        getAuthToken(req);


      if (!token) {
        sendJson(res, 401, {
          message:
            "Not authenticated",
        });

        return true;
      }


      const payload =
        verifyAccessToken(token);


      if (!payload) {
        sendJson(res, 401, {
          message:
            "Invalid or expired access token",
        });

        return true;
      }


      const user =
        await User.findById(
          payload.userId
        );


      if (!user) {
        sendJson(res, 401, {
          message:
            "User not found",
        });

        return true;
      }


      sendJson(res, 200, {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });


      return true;

    } catch (error) {

      console.error(
        "Me error:",
        error
      );

      sendJson(res, 401, {
        message:
          "Not authenticated",
      });

      return true;
    }
  }


  // REFRESH ACCESS TOKEN

  if (
    method === "POST" &&
    url === "/api/auth/refresh"
  ) {
    try {

      const refreshToken =
        getRefreshToken(req);


      // No refresh token

      if (!refreshToken) {

        clearAuthCookie(res);
        clearRefreshTokenCookie(res);

        sendJson(res, 401, {
          message:
            "Refresh token is required",
        });

        return true;
      }


      const tokenHash =
        hashRefreshToken(
          refreshToken
        );


      const storedToken =
        await RefreshToken.findOne({
          tokenHash,
        });


      // Token does not exist

      if (!storedToken) {

        clearAuthCookie(res);
        clearRefreshTokenCookie(res);

        sendJson(res, 401, {
          message:
            "Invalid refresh token",
        });

        return true;
      }


      // Token was already revoked
      // -> possible token reuse

      if (storedToken.revokedAt) {

        await revokeRefreshTokenFamily(
          storedToken.familyId
        );

        clearAuthCookie(res);
        clearRefreshTokenCookie(res);

        sendJson(res, 401, {
          message:
            "Refresh token has been revoked",
        });

        return true;
      }


      // Token expired

      if (
        storedToken.expiresAt.getTime() <=
        Date.now()
      ) {

        await revokeRefreshToken(
          refreshToken
        );

        clearAuthCookie(res);
        clearRefreshTokenCookie(res);

        sendJson(res, 401, {
          message:
            "Refresh token has expired",
        });

        return true;
      }


      // Check user

      const user =
        await User.findById(
          storedToken.userId
        );


      if (!user) {

        await revokeRefreshTokenFamily(
          storedToken.familyId
        );

        clearAuthCookie(res);
        clearRefreshTokenCookie(res);

        sendJson(res, 401, {
          message:
            "User not found",
        });

        return true;
      }


      // Rotate refresh token

      const rotated =
        await rotateStoredRefreshToken(
          storedToken
        );


      if (!rotated) {

        await revokeRefreshTokenFamily(
          storedToken.familyId
        );

        clearAuthCookie(res);
        clearRefreshTokenCookie(res);

        sendJson(res, 401, {
          message:
            "Unable to rotate refresh token",
        });

        return true;
      }


      // Generate new access token

      const accessToken =
        generateAccessToken(
          user._id.toString()
        );


      // Set new cookies

      setAuthCookie(
        res,
        accessToken
      );

      setRefreshTokenCookie(
        res,
        rotated.token
      );


      sendJson(res, 200, {
        message:
          "Token refreshed",
      });


      return true;

    } catch (error) {

      console.error(
        "Refresh token error:",
        error
      );

      clearAuthCookie(res);
      clearRefreshTokenCookie(res);

      sendJson(res, 401, {
        message:
          "Unable to refresh session",
      });

      return true;
    }
  }


  // LOGOUT

  if (
    method === "POST" &&
    url === "/api/auth/logout"
  ) {
    try {

      const refreshToken =
        getRefreshToken(req);


      if (refreshToken) {
        await revokeRefreshToken(
          refreshToken
        );
      }


      clearAuthCookie(res);
      clearRefreshTokenCookie(res);


      sendJson(res, 200, {
        message:
          "Logout successful",
      });


      return true;

    } catch (error) {

      console.error(
        "Logout error:",
        error
      );

      clearAuthCookie(res);
      clearRefreshTokenCookie(res);


      sendJson(res, 200, {
        message:
          "Logout successful",
      });

      return true;
    }
  }


  // FORGOT PASSWORD
  if (
    method === "POST" &&
    url === "/api/auth/forgot-password"
  ) {
    try {

      const body =
        await readBody(req);

      const email = body.email;


      if (
        typeof email !== "string"
      ) {
        sendJson(res, 400, {
          message:
            "Email is required",
        });

        return true;
      }


      const normalizedEmail =
        email.trim().toLowerCase();


      const user =
        await User.findOne({
          email: normalizedEmail,
        });


      // Security: Do not reveal whether the account exists.


      if (user) {

        const resetToken =
          crypto
            .randomBytes(32)
            .toString("hex");


        const resetTokenExpires =
          new Date(
            Date.now() +
            60 * 60 * 1000
          );


        user.resetToken =
          resetToken;

        user.resetTokenExpires =
          resetTokenExpires;


        await user.save();


        const frontendUrl =
          process.env.FRONTEND_URL ||
          "http://localhost:3000";


        const resetLink =
          `${frontendUrl}/reset-password/${resetToken}`;


        await sendResetEmail(
          normalizedEmail,
          resetLink
        );
      }


      sendJson(res, 200, {
        message:
          "If this account exists, a reset email has been sent.",
      });


      return true;

    } catch (error) {

      console.error(
        "Forgot password error:",
        error
      );

      sendJson(res, 500, {
        message:
          "Unable to send reset email",
      });

      return true;
    }
  }


  // RESET PASSWORD
  if (
    method === "POST" &&
    url.startsWith(
      "/api/auth/reset-password/"
    )
  ) {
    try {

      const token =
        url.replace(
          "/api/auth/reset-password/",
          ""
        );


      if (!token) {
        sendJson(res, 400, {
          message:
            "Reset token is required",
        });

        return true;
      }


      const body =
        await readBody(req);

      const password =
        body.password;


      if (
        typeof password !== "string" ||
        password.length < 8
      ) {
        sendJson(res, 400, {
          message:
            "Password must contain at least 8 characters",
        });

        return true;
      }


      const user =
        await User.findOne({
          resetToken: token,
          resetTokenExpires: {
            $gt: new Date(),
          },
        });


      if (!user) {
        sendJson(res, 400, {
          message:
            "Invalid or expired reset link",
        });

        return true;
      }


      const hashedPassword =
        await bcrypt.hash(
          password,
          12
        );


      user.password =
        hashedPassword;

      user.resetToken = null;
      user.resetTokenExpires = null;


      await user.save();


      sendJson(res, 200, {
        message:
          "Password updated successfully",
      });


      return true;

    } catch (error) {

      console.error(
        "Reset password error:",
        error
      );

      sendJson(res, 500, {
        message:
          "Unable to reset password",
      });

      return true;
    }
  }


  // ROUTE NOT FOUND

  return false;
}

import type {
  IncomingMessage,
  ServerResponse,
} from "node:http";

import User from "../models/User.js";

import {
  getAuthToken,
} from "../lib/cookies.js";

import {
  verifyAccessToken,
} from "../lib/jwt.js";


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


export async function authenticate(
  req: IncomingMessage,
  res: ServerResponse
) {
  try {

    const token = getAuthToken(req);


    // NO ACCESS TOKEN

    if (!token) {
      sendJson(res, 401, {
        message: "Not authenticated",
      });

      return null;
    }


    // VERIFY ACCESS TOKEN

    const payload = verifyAccessToken(token);


    if (!payload) {
      sendJson(res, 401, {
        message: "Invalid or expired access token",
      });

      return null;
    }


    // FIND USER

    const user = await User.findById(
      payload.userId
    );


    if (!user) {
      sendJson(res, 401, {
        message: "User not found",
      });

      return null;
    }


    return user;

  } catch (error) {

    console.error(
      "Authentication error:",
      error
    );

    sendJson(res, 401, {
      message: "Not authenticated",
    });

    return null;
  }
}
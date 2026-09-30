import type {IncomingMessage,ServerResponse,} from "node:http";
  
  import User from "../models/User.js";
  import { getAuthToken } from "../lib/cookies.js";
  import { verifyToken } from "../lib/jwt.js";
  
  export async function authenticate(
    req: IncomingMessage,
    res: ServerResponse
  ) {
    const token = getAuthToken(req);
  
    if (!token) {
      res.writeHead(401, {
        "Content-Type": "application/json",
      });
  
      res.end(
        JSON.stringify({
          message: "Not authenticated",
        })
      );
  
      return null;
    }
  
    const payload = verifyToken(token);
  
    if (!payload) {
      res.writeHead(401, {
        "Content-Type": "application/json",
      });
  
      res.end(
        JSON.stringify({
          message: "Invalid or expired token",
        })
      );
  
      return null;
    }
  
    const user = await User.findById(payload.userId);
  
    if (!user) {
      res.writeHead(401, {
        "Content-Type": "application/json",
      });
  
      res.end(
        JSON.stringify({
          message: "User not found",
        })
      );
  
      return null;
    }
  
    return user;
  }
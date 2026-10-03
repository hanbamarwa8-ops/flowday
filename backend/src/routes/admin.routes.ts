import type {
    IncomingMessage,
    ServerResponse,
  } from "node:http";
  
  import mongoose from "mongoose";
  
  import User from "../models/User.js";
  import RefreshToken from "../models/RefreshToken.js";
  
  import { authenticate } from "../middleware/auth.middleware.js";
  import { authorize } from "../middleware/role.middleware.js";
  
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
  
  export async function adminRouter(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<boolean> {
    const method = req.method;
    const url = req.url || "";
  
    // -> GET ALL USERS
  
    if (
      method === "GET" &&
      url === "/api/admin/users"
    ) {
      try {
        const user = await authenticate(req, res);
  
        if (!user) {
          return true;
        }
  
        if (!authorize(user, "ADMIN", res)) {
          return true;
        }
  
        const users = await User.find(
          {},
          {
            password: 0,
            resetToken: 0,
            resetTokenExpires: 0,
          }
        ).sort({
          createdAt: -1,
        });
  
        sendJson(res, 200, {
          users,
        });
  
        return true;
      } catch (error) {
        console.error(
          "Get admin users error:",
          error
        );
  
        sendJson(res, 500, {
          message: "Unable to get users",
        });
  
        return true;
      }
    }
  
    //-> DELETE USER
  
    if (
      method === "DELETE" &&
      url.startsWith("/api/admin/users/")
    ) {
      try {
        const user = await authenticate(req, res);
  
        if (!user) {
          return true;
        }
  
        if (!authorize(user, "ADMIN", res)) {
          return true;
        }
  
        const userId = url.replace(
          "/api/admin/users/",
          ""
        );
  
        if (
          !mongoose.Types.ObjectId.isValid(userId)
        ) {
          sendJson(res, 400, {
            message: "Invalid user id",
          });
  
          return true;
        }
  
        // Prevent an admin from deleting their own account.
        if (user._id.toString() === userId) {
          sendJson(res, 400, {
            message:
              "You cannot delete your own admin account",
          });
  
          return true;
        }
  
        const userToDelete =
          await User.findById(userId);
  
        if (!userToDelete) {
          sendJson(res, 404, {
            message: "User not found",
          });
  
          return true;
        }
  
        // Revoke all refresh tokens belonging to the deleted user.
        await RefreshToken.deleteMany({
          userId: userToDelete._id,
        });
  
        // Delete the user.
        await User.deleteOne({
          _id: userToDelete._id,
        });
  
        sendJson(res, 200, {
          message: "User deleted successfully",
        });
  
        return true;
      } catch (error) {
        console.error(
          "Delete admin user error:",
          error
        );
  
        sendJson(res, 500, {
          message: "Unable to delete user",
        });
  
        return true;
      }
    }
  
    return false;
  }
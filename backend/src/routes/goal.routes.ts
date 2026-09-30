import type {IncomingMessage,ServerResponse,} from "node:http";
  
  import mongoose from "mongoose";
  
  import Goal from "../models/Goal.js";
  import { authenticate } from "../middleware/auth.middleware.js";
  
  
  
  async function readBody(req: IncomingMessage) {
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
  
  
  // GOAL ROUTER
  
  export async function goalRouter(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<boolean> {
  
    const method = req.method;
    const url = req.url || "";
  
  
    // GET ALL GOALS
  
    if (
      method === "GET" &&
      url === "/api/goals"
    ) {
      try {
        const user = await authenticate(req, res);
  
        if (!user) {
          return true;
        }
  
        const goals = await Goal.find({
          userId: user._id,
        }).sort({
          createdAt: -1,
        });
  
        sendJson(res, 200, {
          goals,
        });
  
        return true;
      } catch (error) {
        console.error("Get goals error:", error);
  
        sendJson(res, 500, {
          message: "Unable to get goals",
        });
  
        return true;
      }
    }
  
  
    // CREATE GOAL
  
    if (
      method === "POST" &&
      url === "/api/goals"
    ) {
      try {
        const user = await authenticate(req, res);
  
        if (!user) {
          return true;
        }
  
        const body = await readBody(req);
  
        const title = body.title;
        const description = body.description;
        const targetDate = body.targetDate;
  
        if (
          typeof title !== "string" ||
          !title.trim()
        ) {
          sendJson(res, 400, {
            message: "Goal title is required",
          });
  
          return true;
        }
  
        let parsedTargetDate: Date | null = null;
  
        if (
          targetDate !== undefined &&
          targetDate !== null &&
          targetDate !== ""
        ) {
          const date = new Date(
            String(targetDate)
          );
  
          if (Number.isNaN(date.getTime())) {
            sendJson(res, 400, {
              message: "Invalid target date",
            });
  
            return true;
          }
  
          parsedTargetDate = date;
        }
  
        const goal = await Goal.create({
          userId: user._id,
          title: title.trim(),
          description:
            typeof description === "string"
              ? description.trim()
              : "",
          targetDate: parsedTargetDate,
          status: "active",
        });
  
        sendJson(res, 201, {
          message: "Goal created successfully",
          goal,
        });
  
        return true;
      } catch (error) {
        console.error("Create goal error:", error);
  
        sendJson(res, 500, {
          message: "Unable to create goal",
        });
  
        return true;
      }
    }
  
  
    // GET ONE GOAL
  
    if (
      method === "GET" &&
      url.startsWith("/api/goals/")
    ) {
      try {
        const user = await authenticate(req, res);
  
        if (!user) {
          return true;
        }
  
        const goalId = url.replace(
          "/api/goals/",
          ""
        );
  
        if (!mongoose.isValidObjectId(goalId)) {
          sendJson(res, 400, {
            message: "Invalid goal ID",
          });
  
          return true;
        }
  
        const goal = await Goal.findOne({
          _id: goalId,
          userId: user._id,
        });
  
        if (!goal) {
          sendJson(res, 404, {
            message: "Goal not found",
          });
  
          return true;
        }
  
        sendJson(res, 200, {
          goal,
        });
  
        return true;
      } catch (error) {
        console.error("Get goal error:", error);
  
        sendJson(res, 500, {
          message: "Unable to get goal",
        });
  
        return true;
      }
    }
  
  
    // UPDATE GOAL
  
    if (
      method === "PUT" &&
      url.startsWith("/api/goals/")
    ) {
      try {
        const user = await authenticate(req, res);
  
        if (!user) {
          return true;
        }
  
        const goalId = url.replace(
          "/api/goals/",
          ""
        );
  
        if (!mongoose.isValidObjectId(goalId)) {
          sendJson(res, 400, {
            message: "Invalid goal ID",
          });
  
          return true;
        }
  
        const body = await readBody(req);
  
        const updates: Record<string, unknown> = {};
  
        if (body.title !== undefined) {
          if (
            typeof body.title !== "string" ||
            !body.title.trim()
          ) {
            sendJson(res, 400, {
              message: "Goal title cannot be empty",
            });
  
            return true;
          }
  
          updates.title = body.title.trim();
        }
  
        if (body.description !== undefined) {
          updates.description =
            typeof body.description === "string"
              ? body.description.trim()
              : "";
        }
  
        if (body.status !== undefined) {
          if (
            body.status !== "active" &&
            body.status !== "completed"
          ) {
            sendJson(res, 400, {
              message: "Invalid goal status",
            });
  
            return true;
          }
  
          updates.status = body.status;
        }
  
        if (body.targetDate !== undefined) {
          if (
            body.targetDate === null ||
            body.targetDate === ""
          ) {
            updates.targetDate = null;
          } else {
            const date = new Date(
              String(body.targetDate)
            );
  
            if (Number.isNaN(date.getTime())) {
              sendJson(res, 400, {
                message: "Invalid target date",
              });
  
              return true;
            }
  
            updates.targetDate = date;
          }
        }
  
        const goal =
          await Goal.findOneAndUpdate(
            {
              _id: goalId,
              userId: user._id,
            },
            updates,
            {
              new: true,
              runValidators: true,
            }
          );
  
        if (!goal) {
          sendJson(res, 404, {
            message: "Goal not found",
          });
  
          return true;
        }
  
        sendJson(res, 200, {
          message: "Goal updated successfully",
          goal,
        });
  
        return true;
      } catch (error) {
        console.error(
          "Update goal error:",
          error
        );
  
        sendJson(res, 500, {
          message: "Unable to update goal",
        });
  
        return true;
      }
    }
  
  
    // DELETE GOAL
  
    if (
      method === "DELETE" &&
      url.startsWith("/api/goals/")
    ) {
      try {
        const user = await authenticate(req, res);
  
        if (!user) {
          return true;
        }
  
        const goalId = url.replace(
          "/api/goals/",
          ""
        );
  
        if (!mongoose.isValidObjectId(goalId)) {
          sendJson(res, 400, {
            message: "Invalid goal ID",
          });
  
          return true;
        }
  
        const goal =
          await Goal.findOneAndDelete({
            _id: goalId,
            userId: user._id,
          });
  
        if (!goal) {
          sendJson(res, 404, {
            message: "Goal not found",
          });
  
          return true;
        }
  
        sendJson(res, 200, {
          message: "Goal deleted successfully",
        });
  
        return true;
      } catch (error) {
        console.error(
          "Delete goal error:",
          error
        );
  
        sendJson(res, 500, {
          message: "Unable to delete goal",
        });
  
        return true;
      }
    }
  
  
    return false;
  }
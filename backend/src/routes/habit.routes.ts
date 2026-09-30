import type { IncomingMessage,ServerResponse,} from "node:http";
  
  import mongoose from "mongoose";
  
  import Habit from "../models/Habit.js";
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
  
  // HABIT ROUTER
  
  export async function habitRouter(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<boolean> {
    const method = req.method;
    const url = req.url || "";
  
    // GET ALL HABITS
  
    if (
      method === "GET" &&
      url === "/api/habits"
    ) {
      try {
        const user = await authenticate(req, res);
  
        if (!user) {
          return true;
        }
  
        const habits = await Habit.find({
          userId: user._id,
        }).sort({
          createdAt: -1,
        });
  
        sendJson(res, 200, {
          habits,
        });
  
        return true;
      } catch (error) {
        console.error("Get habits error:", error);
  
        sendJson(res, 500, {
          message: "Unable to get habits",
        });
  
        return true;
      }
    }
  
    // CREATE HABIT
  
    if (
      method === "POST" &&
      url === "/api/habits"
    ) {
      try {
        const user = await authenticate(req, res);
  
        if (!user) {
          return true;
        }
  
        const body = await readBody(req);
  
        const name = body.name;
        const description = body.description;
        const frequency = body.frequency;
  
        if (
          typeof name !== "string" ||
          !name.trim()
        ) {
          sendJson(res, 400, {
            message: "Habit name is required",
          });
  
          return true;
        }
  
        if (
          frequency !== undefined &&
          frequency !== "daily" &&
          frequency !== "weekly"
        ) {
          sendJson(res, 400, {
            message:
              "Frequency must be daily or weekly",
          });
  
          return true;
        }
  
        const habit = await Habit.create({
          userId: user._id,
          name: name.trim(),
          description:
            typeof description === "string"
              ? description.trim()
              : "",
          frequency: frequency ?? "daily",
          completedToday: false,
          currentStreak: 0,
        });
  
        sendJson(res, 201, {
          message: "Habit created successfully",
          habit,
        });
  
        return true;
      } catch (error) {
        console.error(
          "Create habit error:",
          error
        );
  
        sendJson(res, 500, {
          message: "Unable to create habit",
        });
  
        return true;
      }
    }
  
    // GET ONE HABIT
  
    if (
      method === "GET" &&
      url.startsWith("/api/habits/")
    ) {
      try {
        const user = await authenticate(req, res);
  
        if (!user) {
          return true;
        }
  
        const habitId = url.replace(
          "/api/habits/",
          ""
        );
  
        if (!mongoose.isValidObjectId(habitId)) {
          sendJson(res, 400, {
            message: "Invalid habit ID",
          });
  
          return true;
        }
  
        const habit = await Habit.findOne({
          _id: habitId,
          userId: user._id,
        });
  
        if (!habit) {
          sendJson(res, 404, {
            message: "Habit not found",
          });
  
          return true;
        }
  
        sendJson(res, 200, {
          habit,
        });
  
        return true;
      } catch (error) {
        console.error(
          "Get habit error:",
          error
        );
  
        sendJson(res, 500, {
          message: "Unable to get habit",
        });
  
        return true;
      }
    }
  
    // UPDATE HABIT
  
    if (
      method === "PUT" &&
      url.startsWith("/api/habits/")
    ) {
      try {
        const user = await authenticate(req, res);
  
        if (!user) {
          return true;
        }
  
        const habitId = url.replace(
          "/api/habits/",
          ""
        );
  
        if (!mongoose.isValidObjectId(habitId)) {
          sendJson(res, 400, {
            message: "Invalid habit ID",
          });
  
          return true;
        }
  
        const body = await readBody(req);
  
        const updates: Record<string, unknown> = {};
  
        // Name
  
        if (body.name !== undefined) {
          if (
            typeof body.name !== "string" ||
            !body.name.trim()
          ) {
            sendJson(res, 400, {
              message: "Habit name cannot be empty",
            });
  
            return true;
          }
  
          updates.name = body.name.trim();
        }
  
        // Description
  
        if (body.description !== undefined) {
          updates.description =
            typeof body.description === "string"
              ? body.description.trim()
              : "";
        }
  
        // Frequency
  
        if (body.frequency !== undefined) {
          if (
            body.frequency !== "daily" &&
            body.frequency !== "weekly"
          ) {
            sendJson(res, 400, {
              message:
                "Frequency must be daily or weekly",
            });
  
            return true;
          }
  
          updates.frequency =
            body.frequency;
        }
  
        // Completed today
  
        if (
          body.completedToday !== undefined
        ) {
          if (
            typeof body.completedToday !==
            "boolean"
          ) {
            sendJson(res, 400, {
              message:
                "completedToday must be a boolean",
            });
  
            return true;
          }
  
          updates.completedToday =
            body.completedToday;
        }
  
        // Current streak
  
        if (
          body.currentStreak !== undefined
        ) {
          if (
            typeof body.currentStreak !==
              "number" ||
            !Number.isInteger(
              body.currentStreak
            ) ||
            body.currentStreak < 0
          ) {
            sendJson(res, 400, {
              message:
                "currentStreak must be a positive integer",
            });
  
            return true;
          }
  
          updates.currentStreak =
            body.currentStreak;
        }
  
        const habit =
          await Habit.findOneAndUpdate(
            {
              _id: habitId,
              userId: user._id,
            },
            updates,
            {
              new: true,
              runValidators: true,
            }
          );
  
        if (!habit) {
          sendJson(res, 404, {
            message: "Habit not found",
          });
  
          return true;
        }
  
        sendJson(res, 200, {
          message: "Habit updated successfully",
          habit,
        });
  
        return true;
      } catch (error) {
        console.error(
          "Update habit error:",
          error
        );
  
        sendJson(res, 500, {
          message: "Unable to update habit",
        });
  
        return true;
      }
    }
  
    // DELETE HABIT
  
    if (
      method === "DELETE" &&
      url.startsWith("/api/habits/")
    ) {
      try {
        const user = await authenticate(req, res);
  
        if (!user) {
          return true;
        }
  
        const habitId = url.replace(
          "/api/habits/",
          ""
        );
  
        if (!mongoose.isValidObjectId(habitId)) {
          sendJson(res, 400, {
            message: "Invalid habit ID",
          });
  
          return true;
        }
  
        const habit =
          await Habit.findOneAndDelete({
            _id: habitId,
            userId: user._id,
          });
  
        if (!habit) {
          sendJson(res, 404, {
            message: "Habit not found",
          });
  
          return true;
        }
  
        sendJson(res, 200, {
          message: "Habit deleted successfully",
        });
  
        return true;
      } catch (error) {
        console.error(
          "Delete habit error:",
          error
        );
  
        sendJson(res, 500, {
          message: "Unable to delete habit",
        });
  
        return true;
      }
    }
  
    return false;
  }
import "dotenv/config";
import http from "node:http";

import { connectDB } from "./lib/mongodb.js";
import { authRouter } from "./routes/auth.routes.js";
import { taskRouter } from "./routes/task.routes.js";
import { goalRouter } from "./routes/goal.routes.js";
import { habitRouter } from "./routes/habit.routes.js";

const PORT = Number(process.env.PORT) || 4000;

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  "http://localhost:3000";


export const server = http.createServer(
  async (req, res) => {
    // CORS
    res.setHeader(
      "Access-Control-Allow-Origin",
      FRONTEND_URL
    );

    res.setHeader(
      "Access-Control-Allow-Credentials",
      "true"
    );

    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type"
    );

    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );

    // PREFLIGHT
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    res.setHeader(
      "Content-Type",
      "application/json"
    );

    try {
      // AUTH ROUTES
      const authHandled =
        await authRouter(req, res);

      if (authHandled) {
        return;
      }

      // TASK ROUTES
      const taskHandled =
        await taskRouter(req, res);

      if (taskHandled) {
        return;
      }

      // GOAL ROUTES
      const goalHandled =
        await goalRouter(req, res);

      if (goalHandled) {
        return;
      }

      // HABIT ROUTES
      const habitHandled =
        await habitRouter(req, res);

      if (habitHandled) {
        return;
      }

      // ROOT
      if (
        req.method === "GET" &&
        req.url === "/"
      ) {
        res.writeHead(200);

        res.end(
          JSON.stringify({
            message:
              "FlowDay API is running",
          })
        );

        return;
      }

      // HEALTH
      if (
        req.method === "GET" &&
        req.url === "/api/health"
      ) {
        res.writeHead(200);

        res.end(
          JSON.stringify({
            status: "ok",
            service: "flowday-backend",
          })
        );

        return;
      }

      // 404
      res.writeHead(404);

      res.end(
        JSON.stringify({
          message: "Route not found",
        })
      );
    } catch (error) {
      console.error(
        "Server error:",
        error
      );

      if (!res.writableEnded) {
        res.writeHead(500);

        res.end(
          JSON.stringify({
            message:
              "Internal server error",
          })
        );
      }
    }
  }
);

/**
 * Starts the FlowDay backend.
 */
export async function startServer() {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(
        `FlowDay backend running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "Failed to start FlowDay backend:",
      error
    );

    process.exit(1);
  }
}


if (process.env.NODE_ENV !== "test") {
  void startServer();
}
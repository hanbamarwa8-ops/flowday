import mongoose from "mongoose";
import Task from "../models/Task.js";
import { authenticate } from "../middleware/auth.middleware.js";
async function readBody(req) {
    return new Promise((resolve, reject) => {
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
            }
            catch {
                reject(new Error("Invalid JSON"));
            }
        });
        req.on("error", reject);
    });
}
// SEND JSON
function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, {
        "Content-Type": "application/json",
    });
    res.end(JSON.stringify(data));
}
// TASK ROUTER
export async function taskRouter(req, res) {
    const method = req.method;
    const url = req.url || "";
    // GET ALL TASKS
    if (method === "GET" &&
        url === "/api/tasks") {
        try {
            const user = await authenticate(req, res);
            if (!user) {
                return true;
            }
            const tasks = await Task.find({
                userId: user._id,
            }).sort({
                createdAt: -1,
            });
            sendJson(res, 200, {
                tasks,
            });
            return true;
        }
        catch (error) {
            console.error("Get tasks error:", error);
            sendJson(res, 500, {
                message: "Unable to get tasks",
            });
            return true;
        }
    }
    // CREATE TASK
    if (method === "POST" &&
        url === "/api/tasks") {
        try {
            const user = await authenticate(req, res);
            if (!user) {
                return true;
            }
            const body = await readBody(req);
            const title = body.title;
            const description = body.description;
            const priority = body.priority;
            const dueDate = body.dueDate;
            const goalId = body.goalId;
            if (typeof title !== "string" ||
                !title.trim()) {
                sendJson(res, 400, {
                    message: "Task title is required",
                });
                return true;
            }
            if (priority !== undefined &&
                priority !== "low" &&
                priority !== "medium" &&
                priority !== "high") {
                sendJson(res, 400, {
                    message: "Invalid priority",
                });
                return true;
            }
            let parsedDueDate = null;
            if (dueDate !== undefined && dueDate !== null && dueDate !== "") {
                const date = new Date(String(dueDate));
                if (Number.isNaN(date.getTime())) {
                    sendJson(res, 400, {
                        message: "Invalid due date",
                    });
                    return true;
                }
                parsedDueDate = date;
            }
            let parsedGoalId = null;
            if (goalId !== undefined &&
                goalId !== null &&
                goalId !== "") {
                if (!mongoose.isValidObjectId(String(goalId))) {
                    sendJson(res, 400, {
                        message: "Invalid goal ID",
                    });
                    return true;
                }
                parsedGoalId =
                    new mongoose.Types.ObjectId(String(goalId));
            }
            const task = await Task.create({
                userId: user._id,
                title: title.trim(),
                description: typeof description === "string"
                    ? description.trim()
                    : "",
                priority: priority ?? "medium",
                dueDate: parsedDueDate,
                goalId: parsedGoalId,
            });
            sendJson(res, 201, {
                message: "Task created successfully",
                task,
            });
            return true;
        }
        catch (error) {
            console.error("Create task error:", error);
            sendJson(res, 500, {
                message: "Unable to create task",
            });
            return true;
        }
    }
    // GET ONE TASK
    if (method === "GET" &&
        url.startsWith("/api/tasks/")) {
        try {
            const user = await authenticate(req, res);
            if (!user) {
                return true;
            }
            const taskId = url.replace("/api/tasks/", "");
            if (!mongoose.isValidObjectId(taskId)) {
                sendJson(res, 400, {
                    message: "Invalid task ID",
                });
                return true;
            }
            const task = await Task.findOne({
                _id: taskId,
                userId: user._id,
            });
            if (!task) {
                sendJson(res, 404, {
                    message: "Task not found",
                });
                return true;
            }
            sendJson(res, 200, {
                task,
            });
            return true;
        }
        catch (error) {
            console.error("Get task error:", error);
            sendJson(res, 500, {
                message: "Unable to get task",
            });
            return true;
        }
    }
    // UPDATE TASK
    if (method === "PUT" &&
        url.startsWith("/api/tasks/")) {
        try {
            const user = await authenticate(req, res);
            if (!user) {
                return true;
            }
            const taskId = url.replace("/api/tasks/", "");
            if (!mongoose.isValidObjectId(taskId)) {
                sendJson(res, 400, {
                    message: "Invalid task ID",
                });
                return true;
            }
            const body = await readBody(req);
            const updates = {};
            if (body.title !== undefined) {
                if (typeof body.title !== "string" ||
                    !body.title.trim()) {
                    sendJson(res, 400, {
                        message: "Task title cannot be empty",
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
            if (body.completed !== undefined) {
                if (typeof body.completed !== "boolean") {
                    sendJson(res, 400, {
                        message: "Completed must be a boolean",
                    });
                    return true;
                }
                updates.completed = body.completed;
            }
            if (body.priority !== undefined) {
                if (body.priority !== "low" &&
                    body.priority !== "medium" &&
                    body.priority !== "high") {
                    sendJson(res, 400, {
                        message: "Invalid priority",
                    });
                    return true;
                }
                updates.priority = body.priority;
            }
            if (body.dueDate !== undefined) {
                if (body.dueDate === null ||
                    body.dueDate === "") {
                    updates.dueDate = null;
                }
                else {
                    const date = new Date(String(body.dueDate));
                    if (Number.isNaN(date.getTime())) {
                        sendJson(res, 400, {
                            message: "Invalid due date",
                        });
                        return true;
                    }
                    updates.dueDate = date;
                }
            }
            if (body.goalId !== undefined) {
                if (body.goalId === null ||
                    body.goalId === "") {
                    updates.goalId = null;
                }
                else {
                    const goalId = String(body.goalId);
                    if (!mongoose.isValidObjectId(goalId)) {
                        sendJson(res, 400, {
                            message: "Invalid goal ID",
                        });
                        return true;
                    }
                    updates.goalId =
                        new mongoose.Types.ObjectId(goalId);
                }
            }
            const task = await Task.findOneAndUpdate({
                _id: taskId,
                userId: user._id,
            }, updates, {
                new: true,
                runValidators: true,
            });
            if (!task) {
                sendJson(res, 404, {
                    message: "Task not found",
                });
                return true;
            }
            sendJson(res, 200, {
                message: "Task updated successfully",
                task,
            });
            return true;
        }
        catch (error) {
            console.error("Update task error:", error);
            sendJson(res, 500, {
                message: "Unable to update task",
            });
            return true;
        }
    }
    // DELETE TASK
    if (method === "DELETE" &&
        url.startsWith("/api/tasks/")) {
        try {
            const user = await authenticate(req, res);
            if (!user) {
                return true;
            }
            const taskId = url.replace("/api/tasks/", "");
            if (!mongoose.isValidObjectId(taskId)) {
                sendJson(res, 400, {
                    message: "Invalid task ID",
                });
                return true;
            }
            const task = await Task.findOneAndDelete({
                _id: taskId,
                userId: user._id,
            });
            if (!task) {
                sendJson(res, 404, {
                    message: "Task not found",
                });
                return true;
            }
            sendJson(res, 200, {
                message: "Task deleted successfully",
            });
            return true;
        }
        catch (error) {
            console.error("Delete task error:", error);
            sendJson(res, 500, {
                message: "Unable to delete task",
            });
            return true;
        }
    }
    return false;
}
//# sourceMappingURL=task.routes.js.map
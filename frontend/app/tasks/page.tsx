"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {ArrowRight,Check,ListTodo,Plus,Trash2,X,} from "lucide-react";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

type Priority = "low" | "medium" | "high";

type Task = {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  dueDate?: string | null;
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] =
    useState<Priority>("medium");

  const [error, setError] = useState("");

  

  async function loadTasks() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/tasks`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to load your tasks."
        );

        return;
      }

      setTasks(data.tasks || []);
    } catch (error) {
      console.error("Load tasks error:", error);

      setError(
        "Unable to connect to FlowDay."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  // CREATE TASK

  async function handleCreateTask(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!title.trim()) {
      setError("Please enter a task title.");
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch(
        `${API_URL}/api/tasks`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            priority,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to create task."
        );

        return;
      }

      setTasks((currentTasks) => [
        data.task,
        ...currentTasks,
      ]);

      setTitle("");
      setDescription("");
      setPriority("medium");
      setShowForm(false);
    } catch (error) {
      console.error(
        "Create task error:",
        error
      );

      setError(
        "Unable to connect to FlowDay."
      );
    } finally {
      setIsCreating(false);
    }
  }

  // TOGGLE TASK

  async function toggleTask(task: Task) {
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/tasks/${task._id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            completed: !task.completed,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to update task."
        );

        return;
      }

      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask._id === task._id
            ? data.task
            : currentTask
        )
      );
    } catch (error) {
      console.error(
        "Update task error:",
        error
      );

      setError(
        "Unable to connect to FlowDay."
      );
    }
  }

  // DELETE TASK

  async function deleteTask(taskId: string) {
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/tasks/${taskId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to delete task."
        );

        return;
      }

      setTasks((currentTasks) =>
        currentTasks.filter(
          (task) => task._id !== taskId
        )
      );
    } catch (error) {
      console.error(
        "Delete task error:",
        error
      );

      setError(
        "Unable to connect to FlowDay."
      );
    }
  }

  const remainingTasks = tasks.filter(
    (task) => !task.completed
  ).length;

  return (
    <div className="flex min-h-screen bg-[#faf9ff]">
    <Sidebar />

    <div className="flex min-w-0 flex-1 flex-col">
      <Header />

      <main className="flex-1 px-6 py-8 lg:px-10">
        <div className="mx-auto max-w-6xl">

        {/*-> HEADER */}

        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-purple-500">
              Stay organized
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
              Tasks
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
              Organize your day and keep your priorities clear.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowForm((current) => !current)
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-purple-500 px-5 text-sm font-medium text-white shadow-sm shadow-purple-200 transition hover:bg-purple-600"
          >
            {showForm ? (
              <X size={17} />
            ) : (
              <Plus size={17} />
            )}

            {showForm ? "Close" : "New task"}
          </button>
        </div>

        {/* ->CREATE FORM */}

        {showForm && (
          <section className="mt-6 rounded-3xl border border-purple-100 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Create a new task
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Add something you want to accomplish.
              </p>
            </div>

            <form
              onSubmit={handleCreateTask}
              className="space-y-4"
            >
              {/* Title */}

              <div>
                <label
                  htmlFor="task-title"
                  className="mb-2 block text-xs font-semibold text-gray-700"
                >
                  Task title
                </label>

                <input
                  id="task-title"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="Add a task..."
                  className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-300 focus:border-purple-400 focus:ring-4 focus:ring-purple-50"
                />
              </div>

              {/* Description */}

              <div>
                <label
                  htmlFor="task-description"
                  className="mb-2 block text-xs font-semibold text-gray-700"
                >
                  Description
                </label>

                <textarea
                  id="task-description"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Add a little more detail..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-300 focus:border-purple-400 focus:ring-4 focus:ring-purple-50"
                />
              </div>

              {/* Priority */}

              <div>
                <label
                  htmlFor="priority"
                  className="mb-2 block text-xs font-semibold text-gray-700"
                >
                  Priority
                </label>

                <select
                  id="priority"
                  value={priority}
                  onChange={(event) =>
                    setPriority(
                      event.target.value as Priority
                    )
                  }
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-50 sm:w-48"
                >
                  <option value="low">Low</option>
                  <option value="medium">
                    Medium
                  </option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Error */}

              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Submit */}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-purple-500 px-5 text-sm font-medium text-white shadow-sm shadow-purple-200 transition hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCreating
                    ? "Creating..."
                    : "Create task"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setShowForm(false)
                  }
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-200 bg-white px-5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {/* TASK CARD */}

        <section className="mt-8 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">

          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
              <ListTodo
                size={20}
                className="text-purple-600"
              />
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">
                Today&apos;s tasks
              </h2>

              <p className="text-xs text-gray-400">
                {remainingTasks}{" "}
                {remainingTasks === 1
                  ? "task"
                  : "tasks"}{" "}
                remaining
              </p>
            </div>
          </div>

          {/* General error */}

          {error && !showForm && (
            <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Loading */}

          {isLoading ? (
            <div className="rounded-2xl border border-gray-100 bg-[#faf9ff] px-4 py-10 text-center">
              <p className="text-sm text-gray-400">
                Loading your tasks...
              </p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-[#faf9ff] px-6 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100">
                <ListTodo
                  size={21}
                  className="text-purple-600"
                />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-gray-800">
                No tasks yet
              </h3>

              <p className="mt-1 text-xs leading-5 text-gray-400">
                Create your first task and start planning your day.
              </p>

              <button
                type="button"
                onClick={() =>
                  setShowForm(true)
                }
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700"
              >
                <Plus size={15} />
                Create your first task
              </button>
            </div>
          ) : (
            <div className="space-y-3">

              {tasks.map((task) => (
                <div
                  key={task._id}
                  className="group flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-[#faf9ff] p-4 transition hover:border-purple-100"
                >

                  <div className="flex min-w-0 items-center gap-3">

                    {/* Checkbox */}

                    <button
                      type="button"
                      onClick={() =>
                        toggleTask(task)
                      }
                      aria-label={
                        task.completed
                          ? "Mark task as active"
                          : "Mark task as completed"
                      }
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                        task.completed
                          ? "border-purple-500 bg-purple-500 text-white"
                          : "border-gray-300 bg-white hover:border-purple-400"
                      }`}
                    >
                      {task.completed && (
                        <Check size={13} />
                      )}
                    </button>

                    {/* Content */}

                    <div className="min-w-0">

                      <p
                        className={`text-sm font-semibold ${
                          task.completed
                            ? "text-gray-400 line-through"
                            : "text-gray-800"
                        }`}
                      >
                        {task.title}
                      </p>

                      {task.description && (
                        <p
                          className={`mt-1 truncate text-xs ${
                            task.completed
                              ? "text-gray-300"
                              : "text-gray-400"
                          }`}
                        >
                          {task.description}
                        </p>
                      )}

                    </div>
                  </div>

                  {/* Right side */}

                  <div className="flex shrink-0 items-center gap-3">

                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                        task.priority === "high"
                          ? "bg-red-50 text-red-500"
                          : task.priority === "medium"
                          ? "bg-purple-100 text-purple-600"
                          : "bg-green-50 text-green-600"
                      }`}
                    >
                      {task.priority}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        deleteTask(task._id)
                      }
                      aria-label="Delete task"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                    >
                      <Trash2 size={15} />
                    </button>

                  </div>
                </div>
              ))}

            </div>
          )}

          {/* Dashboard */}

          <Link
            href="/dashboard"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700"
          >
            Back to dashboard
            <ArrowRight size={15} />
          </Link>

        </section>
        </div>
      </main>
    </div>
  </div>
  );
}
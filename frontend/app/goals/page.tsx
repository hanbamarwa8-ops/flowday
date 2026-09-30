"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Plus,
  Target,
  Trash2,
  X,
} from "lucide-react";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import AuthGuard from "@/components/AuthGuard";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

type GoalStatus = "active" | "completed";

type Goal = {
  _id: string;
  title: string;
  description?: string;
  targetDate?: string | null;
  status: GoalStatus;
};

function formatDate(date?: string | null) {
  if (!date) {
    return "No deadline";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "No deadline";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
}

function formatDateForInput(date?: string | null) {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toISOString().split("T")[0];
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");

  const [editingGoalId, setEditingGoalId] =
    useState<string | null>(null);

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] =
    useState("");
  const [editTargetDate, setEditTargetDate] =
    useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
  
    const controller = new AbortController();
  
    fetch(`${API_URL}/api/goals`, {
      method: "GET",
      credentials: "include",
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json();
  
        if (cancelled) {
          return;
        }
  
        if (!response.ok) {
          setError(
            data.message ||
              "Unable to load your goals."
          );
  
          return;
        }
  
        setGoals(data.goals || []);
        setError("");
      })
      .catch((error) => {
        if (
          cancelled ||
          error instanceof DOMException &&
            error.name === "AbortError"
        ) {
          return;
        }
  
        console.error(
          "Load goals error:",
          error
        );
  
        setError(
          "Unable to connect to FlowDay."
        );
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });
  
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  // CREATE GOAL

  async function handleCreateGoal(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!title.trim()) {
      setError("Please enter a goal title.");
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch(
        `${API_URL}/api/goals`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            targetDate: targetDate || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to create goal."
        );
        return;
      }

      setGoals((currentGoals) => [
        data.goal,
        ...currentGoals,
      ]);

      setTitle("");
      setDescription("");
      setTargetDate("");
      setShowForm(false);
    } catch (error) {
      console.error(
        "Create goal error:",
        error
      );

      setError(
        "Unable to connect to FlowDay."
      );
    } finally {
      setIsCreating(false);
    }
  }

  // START EDITING

  function startEditing(goal: Goal) {
    setEditingGoalId(goal._id);

    setEditTitle(goal.title);
    setEditDescription(
      goal.description || ""
    );

    setEditTargetDate(
      formatDateForInput(goal.targetDate)
    );

    setError("");
  }

  // CANCEL EDITING

  function cancelEditing() {
    setEditingGoalId(null);

    setEditTitle("");
    setEditDescription("");
    setEditTargetDate("");

    setError("");
  }

  // UPDATE GOAL

  async function updateGoal(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!editingGoalId) {
      return;
    }

    setError("");

    if (!editTitle.trim()) {
      setError("Goal title cannot be empty.");
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch(
        `${API_URL}/api/goals/${editingGoalId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            title: editTitle.trim(),
            description:
              editDescription.trim(),
            targetDate:
              editTargetDate || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to update goal."
        );
        return;
      }

      setGoals((currentGoals) =>
        currentGoals.map((goal) =>
          goal._id === editingGoalId
            ? data.goal
            : goal
        )
      );

      cancelEditing();
    } catch (error) {
      console.error(
        "Update goal error:",
        error
      );

      setError(
        "Unable to connect to FlowDay."
      );
    } finally {
      setIsUpdating(false);
    }
  }

  // TOGGLE GOAL STATUS

  async function toggleGoal(goal: Goal) {
    setError("");

    const newStatus: GoalStatus =
      goal.status === "completed"
        ? "active"
        : "completed";

    try {
      const response = await fetch(
        `${API_URL}/api/goals/${goal._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to update goal."
        );
        return;
      }

      setGoals((currentGoals) =>
        currentGoals.map((currentGoal) =>
          currentGoal._id === goal._id
            ? data.goal
            : currentGoal
        )
      );
    } catch (error) {
      console.error(
        "Toggle goal error:",
        error
      );

      setError(
        "Unable to connect to FlowDay."
      );
    }
  }

  // DELETE GOAL

  async function deleteGoal(goalId: string) {
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/goals/${goalId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to delete goal."
        );
        return;
      }

      setGoals((currentGoals) =>
        currentGoals.filter(
          (goal) => goal._id !== goalId
        )
      );

      if (editingGoalId === goalId) {
        cancelEditing();
      }
    } catch (error) {
      console.error(
        "Delete goal error:",
        error
      );

      setError(
        "Unable to connect to FlowDay."
      );
    }
  }

  const activeGoals = goals.filter(
    (goal) => goal.status === "active"
  ).length;

  return (
    <AuthGuard>
    <div className="flex min-h-screen bg-[#faf9ff]">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <main className="flex-1 px-6 py-8 lg:px-10">
          <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-purple-500">
              Keep moving forward
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
              Goals
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
              Turn bigger ambitions into clear and measurable progress.
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

            {showForm ? "Close" : "New goal"}
          </button>
        </div>

        {/* CREATE FORM */}
        {showForm && (
          <section className="mt-6 rounded-3xl border border-purple-100 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Create a new goal
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Define something meaningful you want to achieve.
              </p>
            </div>

            <form
              onSubmit={handleCreateGoal}
              className="space-y-4"
            >
              {/* Goal title */}

              <div>
                <label
                  htmlFor="goal-title"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Goal title
                </label>

                <input
                  id="goal-title"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="What do you want to achieve?"
                  className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-purple-400 focus:ring-4 focus:ring-purple-50"
                />
              </div>

              {/* Description */}

              <div>
                <label
                  htmlFor="goal-description"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Description
                </label>

                <textarea
                  id="goal-description"
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  placeholder="Describe your goal..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-purple-400 focus:ring-4 focus:ring-purple-50"
                />
              </div>

              {/* Target date */}

              <div>
                <label
                  htmlFor="target-date"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Target date
                </label>

                <input
                  id="target-date"
                  type="date"
                  value={targetDate}
                  onChange={(event) =>
                    setTargetDate(
                      event.target.value
                    )
                  }
                  className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-gray-700 outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-50 sm:w-56"
                />
              </div>

              {/* Error */}

              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Actions */}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-purple-500 px-5 text-sm font-medium text-white shadow-sm shadow-purple-200 transition hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCreating
                    ? "Creating..."
                    : "Create goal"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setError("");
                  }}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-200 bg-white px-5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {/* GOALS */}

        <section className="mt-8">

          {/* General error */}

          {error && !showForm && (
            <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Loading */}

          {isLoading ? (
            <div className="rounded-3xl border border-gray-100 bg-white px-6 py-12 text-center shadow-sm">
              <p className="text-sm text-gray-400">
                Loading your goals...
              </p>
            </div>
          ) : goals.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-100">
                <Target
                  size={21}
                  className="text-pink-600"
                />
              </div>

              <h2 className="mt-4 text-sm font-semibold text-gray-800">
                No goals yet
              </h2>

              <p className="mt-1 text-xs leading-5 text-gray-400">
                Create your first goal and start turning your plans into progress.
              </p>

              <button
                type="button"
                onClick={() =>
                  setShowForm(true)
                }
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700"
              >
                <Plus size={15} />
                Create your first goal
              </button>
            </div>
          ) : (
            <>
              {/* Summary */}

              <div className="mb-5">
                <p className="text-xs text-gray-400">
                  {activeGoals} active{" "}
                  {activeGoals === 1
                    ? "goal"
                    : "goals"}
                </p>
              </div>

              {/* Goal cards */}

              <div className="grid gap-5 md:grid-cols-2">

                {goals.map((goal) => {
                  const progress =
                    goal.status === "completed"
                      ? 100
                      : 0;

                  return (
                    <article
                      key={goal._id}
                      className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >

                      {/* Top */}

                      <div className="flex items-start justify-between gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-100">
                          <Target
                            size={21}
                            className="text-pink-600"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                              goal.status ===
                              "completed"
                                ? "bg-green-50 text-green-600"
                                : "bg-purple-100 text-purple-600"
                            }`}
                          >
                            {goal.status ===
                            "completed"
                              ? "Completed"
                              : "Active"}
                          </span>

                          <span className="text-sm font-semibold text-purple-600">
                            {progress}%
                          </span>
                        </div>
                      </div>

                      {/* Title */}

                      <h2
                        className={`mt-5 text-lg font-semibold ${
                          goal.status ===
                          "completed"
                            ? "text-gray-400 line-through"
                            : "text-gray-900"
                        }`}
                      >
                        {goal.title}
                      </h2>

                      {/* Description */}

                      {goal.description && (
                        <p className="mt-2 text-sm leading-6 text-gray-500">
                          {goal.description}
                        </p>
                      )}

                      {/* Deadline */}

                      <p className="mt-3 text-xs text-gray-400">
                        Target:{" "}
                        {formatDate(
                          goal.targetDate
                        )}
                      </p>

                      {/* Progress */}

                      <div className="mt-5 h-3 overflow-hidden rounded-full bg-purple-50">
                        <div
                          className="h-full rounded-full bg-purple-500 transition-all"
                          style={{
                            width: `${progress}%`,
                          }}
                        />
                      </div>

                      <p className="mt-3 text-xs text-gray-400">
                        {goal.status ===
                        "completed"
                          ? "Goal completed."
                          : "Keep building consistent progress."}
                      </p>

                      {/* Edit form */}

                      {editingGoalId ===
                        goal._id && (
                        <form
                          onSubmit={updateGoal}
                          className="mt-5 space-y-4 rounded-2xl border border-purple-100 bg-[#faf9ff] p-4"
                        >
                          {/* Edit title */}

                          <div>
                            <label
                              htmlFor={`edit-title-${goal._id}`}
                              className="mb-2 block text-sm font-medium text-gray-700"
                            >
                              Goal title
                            </label>

                            <input
                              id={`edit-title-${goal._id}`}
                              value={editTitle}
                              onChange={(
                                event
                              ) =>
                                setEditTitle(
                                  event.target.value
                                )
                              }
                              className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-50"
                            />
                          </div>

                          {/* Edit description */}

                          <div>
                            <label
                              htmlFor={`edit-description-${goal._id}`}
                              className="mb-2 block text-sm font-medium text-gray-700"
                            >
                              Description
                            </label>

                            <textarea
                              id={`edit-description-${goal._id}`}
                              value={
                                editDescription
                              }
                              onChange={(
                                event
                              ) =>
                                setEditDescription(
                                  event.target.value
                                )
                              }
                              rows={3}
                              className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-50"
                            />
                          </div>

                          {/* Edit target date */}

                          <div>
                            <label
                              htmlFor={`edit-date-${goal._id}`}
                              className="mb-2 block text-sm font-medium text-gray-700"
                            >
                              Target date
                            </label>

                            <input
                              id={`edit-date-${goal._id}`}
                              type="date"
                              value={
                                editTargetDate
                              }
                              onChange={(
                                event
                              ) =>
                                setEditTargetDate(
                                  event.target.value
                                )
                              }
                              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-50"
                            />
                          </div>

                          {/* Edit error */}

                          {error && (
                            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                              {error}
                            </div>
                          )}

                          {/* Edit actions */}

                          <div className="flex gap-3">
                            <button
                              type="submit"
                              disabled={isUpdating}
                              className="inline-flex h-9 items-center justify-center rounded-lg bg-purple-500 px-4 text-xs font-medium text-white transition hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isUpdating
                                ? "Saving..."
                                : "Save changes"}
                            </button>

                            <button
                              type="button"
                              onClick={
                                cancelEditing
                              }
                              className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Actions */}

                      <div className="mt-5 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            startEditing(goal)
                          }
                          className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-600"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            toggleGoal(goal)
                          }
                          className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-600"
                        >
                          <Check size={14} />

                          {goal.status ===
                          "completed"
                            ? "Mark active"
                            : "Mark completed"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteGoal(
                              goal._id
                            )
                          }
                          aria-label="Delete goal"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-300 transition hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                    </article>
                  );
                })}

              </div>
            </>
          )}
        </section>

        {/* BACK TO DASHBOARD */}

        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700"
        >
          Back to dashboard
          <ArrowRight size={15} />
        </Link>

        </div>
        </main>
      </div>
    </div>
  </AuthGuard>
);
}
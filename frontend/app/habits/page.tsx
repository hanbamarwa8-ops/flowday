"use client";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import AuthGuard from "@/components/AuthGuard";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Flame,
  Plus,
  Trash2,
  X,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

type Frequency = "daily" | "weekly";

type Habit = {
  _id: string;
  name: string;
  description?: string;
  frequency: Frequency;
  completedToday: boolean;
  currentStreak: number;
};

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] =
    useState<Frequency>("daily");

  const [editingHabitId, setEditingHabitId] =
    useState<string | null>(null);

  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] =
    useState("");
  const [editFrequency, setEditFrequency] =
    useState<Frequency>("daily");

  const [error, setError] = useState("");

  // LOAD HABITS
  
  useEffect(() => {
    let cancelled = false;
  
    const controller = new AbortController();
  
    fetch(`${API_URL}/api/habits`, {
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
              "Unable to load your habits."
          );
  
          return;
        }
  
        setHabits(data.habits || []);
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
          "Load habits error:",
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

  // CREATE HABIT

  async function handleCreateHabit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Please enter a habit name.");
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch(
        `${API_URL}/api/habits`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            name: name.trim(),
            description: description.trim(),
            frequency,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to create habit."
        );
        return;
      }

      setHabits((currentHabits) => [
        data.habit,
        ...currentHabits,
      ]);

      setName("");
      setDescription("");
      setFrequency("daily");
      setShowForm(false);
    } catch (error) {
      console.error(
        "Create habit error:",
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

  function startEditing(habit: Habit) {
    setEditingHabitId(habit._id);

    setEditName(habit.name);
    setEditDescription(
      habit.description || ""
    );
    setEditFrequency(habit.frequency);

    setError("");
  }

  // CANCEL EDITING

  function cancelEditing() {
    setEditingHabitId(null);

    setEditName("");
    setEditDescription("");
    setEditFrequency("daily");

    setError("");
  }

  // UPDATE HABIT

  async function updateHabit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!editingHabitId) {
      return;
    }

    setError("");

    if (!editName.trim()) {
      setError("Habit name cannot be empty.");
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch(
        `${API_URL}/api/habits/${editingHabitId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            name: editName.trim(),
            description:
              editDescription.trim(),
            frequency: editFrequency,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to update habit."
        );
        return;
      }

      setHabits((currentHabits) =>
        currentHabits.map((habit) =>
          habit._id === editingHabitId
            ? data.habit
            : habit
        )
      );

      cancelEditing();
    } catch (error) {
      console.error(
        "Update habit error:",
        error
      );

      setError(
        "Unable to connect to FlowDay."
      );
    } finally {
      setIsUpdating(false);
    }
  }


  async function toggleHabit(habit: Habit) {
    setError("");

    const completedToday =
      !habit.completedToday;

    const currentStreak =
      completedToday
        ? habit.currentStreak + 1
        : Math.max(
            0,
            habit.currentStreak - 1
          );

    try {
      const response = await fetch(
        `${API_URL}/api/habits/${habit._id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            completedToday,
            currentStreak,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to update habit."
        );
        return;
      }

      setHabits((currentHabits) =>
        currentHabits.map((currentHabit) =>
          currentHabit._id === habit._id
            ? data.habit
            : currentHabit
        )
      );
    } catch (error) {
      console.error(
        "Toggle habit error:",
        error
      );

      setError(
        "Unable to connect to FlowDay."
      );
    }
  }

  // DELETE HABIT

  async function deleteHabit(
    habitId: string
  ) {
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/habits/${habitId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to delete habit."
        );
        return;
      }

      setHabits((currentHabits) =>
        currentHabits.filter(
          (habit) =>
            habit._id !== habitId
        )
      );

      if (editingHabitId === habitId) {
        cancelEditing();
      }
    } catch (error) {
      console.error(
        "Delete habit error:",
        error
      );

      setError(
        "Unable to connect to FlowDay."
      );
    }
  }

  const completedTodayCount =
    habits.filter(
      (habit) => habit.completedToday
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
              Build consistency
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
              Habits
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
              Small actions repeated consistently can create meaningful progress.
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

            {showForm ? "Close" : "New habit"}
          </button>
        </div>

        {/* CREATE FORM */}

        {showForm && (
          <section className="mt-6 rounded-3xl border border-purple-100 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Create a new habit
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Choose a small action you want to repeat consistently.
              </p>
            </div>

            <form
              onSubmit={handleCreateHabit}
              className="space-y-4"
            >
              {/* Name */}

              <div>
                <label
                  htmlFor="habit-name"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Habit name
                </label>

                <input
                  id="habit-name"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                  placeholder="What habit do you want to build?"
                  className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-purple-400 focus:ring-4 focus:ring-purple-50"
                />
              </div>

              {/* Description */}

              <div>
                <label
                  htmlFor="habit-description"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Description
                </label>

                <textarea
                  id="habit-description"
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  placeholder="Add a little more detail..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-purple-400 focus:ring-4 focus:ring-purple-50"
                />
              </div>

              {/* Frequency */}

              <div>
                <label
                  htmlFor="frequency"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Frequency
                </label>

                <select
                  id="frequency"
                  value={frequency}
                  onChange={(event) =>
                    setFrequency(
                      event.target.value as Frequency
                    )
                  }
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-50 sm:w-48"
                >
                  <option value="daily">
                    Daily
                  </option>

                  <option value="weekly">
                    Weekly
                  </option>
                </select>
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
                    : "Create habit"}
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

        {/* HABITS */}

        <section className="mt-8">

          {/* General error */}

          {error && !showForm && (
            <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Summary */}

          {!isLoading &&
            habits.length > 0 && (
              <div className="mb-5 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  {completedTodayCount} of{" "}
                  {habits.length} completed today
                </p>
              </div>
            )}

          {/* Loading */}

          {isLoading ? (
            <div className="rounded-3xl border border-gray-100 bg-white px-6 py-12 text-center shadow-sm">
              <p className="text-sm text-gray-400">
                Loading your habits...
              </p>
            </div>
          ) : habits.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100">
                <Flame
                  size={21}
                  className="text-green-600"
                />
              </div>

              <h2 className="mt-4 text-sm font-semibold text-gray-800">
                No habits yet
              </h2>

              <p className="mt-1 text-xs leading-5 text-gray-400">
                Create your first habit and start building consistency.
              </p>

              <button
                type="button"
                onClick={() =>
                  setShowForm(true)
                }
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700"
              >
                <Plus size={15} />
                Create your first habit
              </button>
            </div>
          ) : (
            <div className="space-y-3">

              {habits.map((habit) => (
                <article
                  key={habit._id}
                  className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                >
                  {/* Habit header */}

                  <div className="flex items-center justify-between gap-4">

                    <div className="flex min-w-0 items-center gap-4">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100">
                        <Flame
                          size={20}
                          className="text-green-600"
                        />
                      </div>

                      <div className="min-w-0">
                        <h2
                          className={`text-sm font-semibold ${
                            habit.completedToday
                              ? "text-gray-400"
                              : "text-gray-800"
                          }`}
                        >
                          {habit.name}
                        </h2>

                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <p className="text-xs text-gray-400">
                            {habit.currentStreak} day{" "}
                            {habit.currentStreak ===
                            1
                              ? "streak"
                              : "streak"}
                          </p>

                          <span className="text-gray-300">
                            •
                          </span>

                          <p className="text-xs capitalize text-gray-400">
                            {habit.frequency}
                          </p>
                        </div>

                        {habit.description && (
                          <p className="mt-2 max-w-xl text-xs leading-5 text-gray-400">
                            {habit.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Complete */}

                    <button
                      type="button"
                      onClick={() =>
                        toggleHabit(habit)
                      }
                      aria-label={
                        habit.completedToday
                          ? "Mark habit as incomplete"
                          : "Mark habit as completed"
                      }
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition ${
                        habit.completedToday
                          ? "border-green-200 bg-green-100 text-green-600"
                          : "border-gray-200 bg-white text-gray-300 hover:border-green-200 hover:bg-green-50 hover:text-green-600"
                      }`}
                    >
                      <Check size={17} />
                    </button>
                  </div>

                  {/* Edit form */}

                  {editingHabitId ===
                    habit._id && (
                    <form
                      onSubmit={updateHabit}
                      className="mt-5 space-y-4 rounded-2xl border border-purple-100 bg-[#faf9ff] p-4"
                    >
                      {/* Edit name */}

                      <div>
                        <label
                          htmlFor={`edit-name-${habit._id}`}
                          className="mb-2 block text-sm font-medium text-gray-700"
                        >
                          Habit name
                        </label>

                        <input
                          id={`edit-name-${habit._id}`}
                          value={editName}
                          onChange={(event) =>
                            setEditName(
                              event.target.value
                            )
                          }
                          className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-50"
                        />
                      </div>

                      {/* Edit description */}

                      <div>
                        <label
                          htmlFor={`edit-description-${habit._id}`}
                          className="mb-2 block text-sm font-medium text-gray-700"
                        >
                          Description
                        </label>

                        <textarea
                          id={`edit-description-${habit._id}`}
                          value={
                            editDescription
                          }
                          onChange={(event) =>
                            setEditDescription(
                              event.target.value
                            )
                          }
                          rows={3}
                          className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-50"
                        />
                      </div>

                      {/* Edit frequency */}

                      <div>
                        <label
                          htmlFor={`edit-frequency-${habit._id}`}
                          className="mb-2 block text-sm font-medium text-gray-700"
                        >
                          Frequency
                        </label>

                        <select
                          id={`edit-frequency-${habit._id}`}
                          value={
                            editFrequency
                          }
                          onChange={(event) =>
                            setEditFrequency(
                              event.target.value as Frequency
                            )
                          }
                          className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-50"
                        >
                          <option value="daily">
                            Daily
                          </option>

                          <option value="weekly">
                            Weekly
                          </option>
                        </select>
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

                  <div className="mt-4 flex items-center gap-3 border-t border-gray-50 pt-4">

                    <button
                      type="button"
                      onClick={() =>
                        startEditing(habit)
                      }
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-600"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteHabit(
                          habit._id
                        )
                      }
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-300 transition hover:bg-red-50 hover:text-red-500"
                      aria-label="Delete habit"
                    >
                      <Trash2 size={15} />
                    </button>

                  </div>
                </article>
              ))}

            </div>
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
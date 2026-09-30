"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Flame,
  ListTodo,
  Target,
  Timer,
  TrendingUp,
} from "lucide-react";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import AuthGuard from "@/components/AuthGuard";

import TaskCard from "@/components/dashboard/TaskCard";
import GoalCard from "@/components/dashboard/GoalCard";
import HabitCard from "@/components/dashboard/HabitCard";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

type TaskPriority = "low" | "medium" | "high";

type Task = {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: TaskPriority;
  dueDate?: string | null;
};

type Goal = {
  _id: string;
  title: string;
  description?: string;
  targetDate?: string | null;
  status: "active" | "completed";
};

type Habit = {
  _id: string;
  name: string;
  description?: string;
  frequency: "daily" | "weekly";
  completedToday: boolean;
  currentStreak: number;
};

type User = {
  id?: string;
  _id?: string;
  name: string;
  email: string;
};

// HELPERS

function formatPriority(
  priority: TaskPriority
): "High" | "Medium" | "Low" {
  if (priority === "high") {
    return "High";
  }

  if (priority === "medium") {
    return "Medium";
  }

  return "Low";
}

function formatDeadline(
  date?: string | null
) {
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
  }).format(parsedDate);
}

// DASHBOARD

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] =
    useState<User | null>(null);

  const [tasks, setTasks] =
    useState<Task[]>([]);

  const [goals, setGoals] =
    useState<Goal[]>([]);

  const [habits, setHabits] =
    useState<Habit[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // LOAD DATA

  useEffect(() => {
    async function loadDashboard() {
      try {
        setIsLoading(true);
        setError("");

        const [
          userResponse,
          tasksResponse,
          goalsResponse,
          habitsResponse,
        ] = await Promise.all([
          fetch(
            `${API_URL}/api/auth/me`,
            {
              method: "GET",
              credentials: "include",
              cache: "no-store",
            }
          ),

          fetch(
            `${API_URL}/api/tasks`,
            {
              method: "GET",
              credentials: "include",
              cache: "no-store",
            }
          ),

          fetch(
            `${API_URL}/api/goals`,
            {
              method: "GET",
              credentials: "include",
              cache: "no-store",
            }
          ),

          fetch(
            `${API_URL}/api/habits`,
            {
              method: "GET",
              credentials: "include",
              cache: "no-store",
            }
          ),
        ]);

        // Session expired
        if (userResponse.status === 401) {
          router.replace("/login");
          return;
        }

        const userData =
          await userResponse.json();

        const tasksData =
          await tasksResponse.json();

        const goalsData =
          await goalsResponse.json();

        const habitsData =
          await habitsResponse.json();

        // CHECK RESPONSES

        if (!userResponse.ok) {
          throw new Error(
            userData.message ||
              "Unable to load your session."
          );
        }

        if (!tasksResponse.ok) {
          throw new Error(
            tasksData.message ||
              "Unable to load tasks."
          );
        }

        if (!goalsResponse.ok) {
          throw new Error(
            goalsData.message ||
              "Unable to load goals."
          );
        }

        if (!habitsResponse.ok) {
          throw new Error(
            habitsData.message ||
              "Unable to load habits."
          );
        }

        // SAVE DATA

        setUser(userData.user);

        setTasks(
          Array.isArray(tasksData.tasks)
            ? tasksData.tasks
            : []
        );

        setGoals(
          Array.isArray(goalsData.goals)
            ? goalsData.goals
            : []
        );

        setHabits(
          Array.isArray(habitsData.habits)
            ? habitsData.habits
            : []
        );
      } catch (error) {
        console.error(
          "Dashboard error:",
          error
        );

        setError(
          "Unable to load your dashboard."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  // COMPUTED DATA

  const completedTasks = useMemo(
    () =>
      tasks.filter(
        (task) => task.completed
      ).length,
    [tasks]
  );

  const taskProgress =
    tasks.length > 0
      ? Math.round(
          (completedTasks / tasks.length) * 100
        )
      : 0;

  const completedHabits = useMemo(
    () =>
      habits.filter(
        (habit) =>
          habit.completedToday
      ).length,
    [habits]
  );

  const activeGoals = useMemo(
    () =>
      goals.filter(
        (goal) =>
          goal.status === "active"
      ).length,
    [goals]
  );

  const displayTasks =
    tasks.slice(0, 3);

  const displayHabits =
    habits.slice(0, 3);

  const displayGoals =
    goals.slice(0, 2);

  // CONTENT

  function renderDashboard() {
    if (isLoading) {
      return (
        <div className="min-h-screen bg-[#faf9ff] md:flex">
          <Sidebar />

          <div className="flex min-h-screen flex-1 flex-col">
            <Header />

            <main className="flex flex-1 items-center justify-center px-6 py-8">
              <p className="text-sm text-gray-400">
                Loading your dashboard...
              </p>
            </main>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#faf9ff] md:flex">

        {/* SIDEBAR */}

        <Sidebar />

        {/* MAIN */}

        <div className="flex min-h-screen flex-1 flex-col">

          <Header />

          <main className="flex-1 px-6 py-8 lg:px-10">
            <div className="mx-auto max-w-7xl">

              {/* WELCOME */}

              <section className="mb-8">

                <p className="text-sm font-medium text-purple-500">
                  Your day starts here
                </p>

                <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
                  Welcome back,{" "}
                  {user?.name || "there"} 👋
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
                  Stay focused on what matters, build consistent
                  habits, and make progress toward your goals.
                </p>

              </section>

              {/* ERROR */}

              {error && (
                <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* TOP CARDS */}

              <section className="grid gap-6 lg:grid-cols-3">

                {/* FOCUS */}

                <div className="rounded-3xl bg-purple-600 p-6 text-white shadow-sm">

                  <p className="text-sm font-medium text-purple-100">
                    Today&apos;s Focus
                  </p>

                  <h2 className="mt-4 text-2xl font-semibold">
                    Focus on what matters most.
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-purple-100">
                    Start a focused session and give your attention
                    to one task at a time.
                  </p>

                  <Link
                  href="/focus"
                  className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-purple-600 shadow-sm transition hover:bg-purple-50"
                 ><Timer
                 size={17}
                 strokeWidth={2}
                 className="text-purple-600" />
                 <span className="text-purple-600">
                   Start Focus
                   </span>
                   </Link>

                </div>

                {/* TASK PROGRESS */}

                <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">

                  <p className="text-sm font-medium text-gray-400">
                    Task Progress
                  </p>

                  <div className="mt-5 flex items-end gap-2">

                    <span className="text-4xl font-bold text-gray-900">
                      {taskProgress}%
                    </span>

                    <span className="mb-1 text-sm text-gray-400">
                      completed
                    </span>

                  </div>

                  <div className="mt-5 h-3 overflow-hidden rounded-full bg-purple-50">

                    <div
                      className="h-full rounded-full bg-purple-500 transition-all duration-500"
                      style={{
                        width: `${taskProgress}%`,
                      }}
                    />

                  </div>

                  <p className="mt-4 text-xs text-gray-400">
                    {completedTasks} of{" "}
                    {tasks.length} tasks completed
                  </p>

                </div>

                {/* HABITS */}

                <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">

                  <div className="flex items-center justify-between">

                    <p className="text-sm font-medium text-gray-400">
                      Habits Today
                    </p>

                    <Flame
                      size={20}
                      strokeWidth={1.8}
                      className="text-green-500"
                    />

                  </div>

                  <div className="mt-5">

                    <span className="text-4xl font-bold text-gray-900">
                      {completedHabits}
                    </span>

                    <span className="ml-2 text-sm text-gray-400">
                      / {habits.length} completed
                    </span>

                  </div>

                  <div className="mt-5 flex items-center gap-2 text-sm text-green-500">

                    <TrendingUp
                      size={16}
                      strokeWidth={1.8}
                    />

                    <span>
                      {activeGoals} active{" "}
                      {activeGoals === 1
                        ? "goal"
                        : "goals"}
                    </span>

                  </div>

                </div>

              </section>

              {/* TASKS + HABITS */}

              <section className="mt-8 grid gap-8 lg:grid-cols-2">

                {/* TASKS */}

                <div>

                  <div className="mb-4 flex items-center justify-between">

                    <div>

                      <h2 className="text-lg font-semibold text-gray-900">
                        Your Tasks
                      </h2>

                      <p className="mt-1 text-xs text-gray-400">
                        What needs your attention
                      </p>

                    </div>

                    <Link
                      href="/tasks"
                      className="text-sm font-medium text-purple-600 hover:text-purple-700"
                    >
                      View all
                    </Link>

                  </div>

                  <div className="space-y-3">

                    {displayTasks.length === 0 ? (

                      <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-5 py-8 text-center">

                        <ListTodo
                          size={21}
                          className="mx-auto text-gray-300"
                        />

                        <p className="mt-3 text-sm font-medium text-gray-600">
                          No tasks yet
                        </p>

                        <Link
                          href="/tasks"
                          className="mt-2 inline-block text-xs font-medium text-purple-600"
                        >
                          Create a task
                        </Link>

                      </div>

                    ) : (

                      displayTasks.map(
                        (task) => (
                          <TaskCard
                            key={task._id}
                            title={task.title}
                            category={
                              task.description ||
                              "Task"
                            }
                            priority={formatPriority(
                              task.priority
                            )}
                            completed={
                              task.completed
                            }
                          />
                        )
                      )

                    )}

                  </div>

                </div>

                {/* HABITS */}

                <div>

                  <div className="mb-4 flex items-center justify-between">

                    <div>

                      <h2 className="text-lg font-semibold text-gray-900">
                        Today&apos;s Habits
                      </h2>

                      <p className="mt-1 text-xs text-gray-400">
                        Build consistency one day at a time
                      </p>

                    </div>

                    <Link
                      href="/habits"
                      className="text-sm font-medium text-purple-600 hover:text-purple-700"
                    >
                      View all
                    </Link>

                  </div>

                  <div className="space-y-3">

                    {displayHabits.length === 0 ? (

                      <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-5 py-8 text-center">

                        <Flame
                          size={21}
                          className="mx-auto text-gray-300"
                        />

                        <p className="mt-3 text-sm font-medium text-gray-600">
                          No habits yet
                        </p>

                        <Link
                          href="/habits"
                          className="mt-2 inline-block text-xs font-medium text-purple-600"
                        >
                          Create a habit
                        </Link>

                      </div>

                    ) : (

                      displayHabits.map(
                        (habit) => (
                          <HabitCard
                            key={habit._id}
                            name={habit.name}
                            streak={
                              habit.currentStreak
                            }
                            completed={
                              habit.completedToday
                            }
                          />
                        )
                      )

                    )}

                  </div>

                </div>

              </section>

              {/* GOALS */}

              <section className="mt-8">

                <div className="mb-4 flex items-center justify-between">

                  <div>

                    <h2 className="text-lg font-semibold text-gray-900">
                      Current Goals
                    </h2>

                    <p className="mt-1 text-xs text-gray-400">
                      Keep moving toward what matters
                    </p>

                  </div>

                  <Link
                    href="/goals"
                    className="text-sm font-medium text-purple-600 hover:text-purple-700"
                  >
                    View all
                  </Link>

                </div>

                {displayGoals.length === 0 ? (

                  <div className="rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-10 text-center">

                    <Target
                      size={22}
                      className="mx-auto text-gray-300"
                    />

                    <p className="mt-3 text-sm font-medium text-gray-600">
                      No goals yet
                    </p>

                    <Link
                      href="/goals"
                      className="mt-2 inline-block text-xs font-medium text-purple-600"
                    >
                      Create a goal
                    </Link>

                  </div>

                ) : (

                  <div className="grid gap-4 md:grid-cols-2">

                    {displayGoals.map(
                      (goal) => (

                        <GoalCard
                          key={goal._id}
                          title={goal.title}
                          progress={
                            goal.status ===
                            "completed"
                              ? 100
                              : 0
                          }
                          deadline={formatDeadline(
                            goal.targetDate
                          )}
                        />

                      )
                    )}

                  </div>

                )}

              </section>

              {/* QUICK STATS */}

              <section className="mt-8 grid gap-4 sm:grid-cols-3">

                {/* COMPLETED TASKS */}

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">

                      <CheckCircle2
                        size={19}
                        className="text-purple-600"
                      />

                    </div>

                    <div>

                      <p className="text-xs text-gray-400">
                        Completed tasks
                      </p>

                      <p className="text-xl font-semibold text-gray-900">
                        {completedTasks}
                      </p>

                    </div>

                  </div>

                </div>

                {/* COMPLETED HABITS */}

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">

                      <Flame
                        size={19}
                        className="text-green-600"
                      />

                    </div>

                    <div>

                      <p className="text-xs text-gray-400">
                        Habits completed
                      </p>

                      <p className="text-xl font-semibold text-gray-900">
                        {completedHabits}
                      </p>

                    </div>

                  </div>

                </div>

                {/* ACTIVE GOALS */}

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100">

                      <Target
                        size={19}
                        className="text-pink-600"
                      />

                    </div>

                    <div>

                      <p className="text-xs text-gray-400">
                        Active goals
                      </p>

                      <p className="text-xl font-semibold text-gray-900">
                        {activeGoals}
                      </p>

                    </div>

                  </div>

                </div>

              </section>

            </div>
          </main>

        </div>
      </div>
    );
  }

  // AUTH PROTECTION

  return (
    <AuthGuard>
      {renderDashboard()}
    </AuthGuard>
  );
}
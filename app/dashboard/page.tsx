import {Clock3,TrendingUp,} from "lucide-react";
  
  import Sidebar from "@/components/Sidebar";
  import Header from "@/components/Header";
  import TaskCard from "@/components/dashboard/TaskCard";
  import GoalCard from "@/components/dashboard/GoalCard";
  import HabitCard from "@/components/dashboard/HabitCard";
  
  export default function DashboardPage() {
    return (
      <div className="min-h-screen bg-[#faf9ff] md:flex">
        <Sidebar />
  
        <div className="flex min-h-screen flex-1 flex-col">
          <Header />
  
          <main className="flex-1 px-6 py-8 lg:px-10">
            <div className="mx-auto max-w-7xl">
  
              {/* Welcome */}
              <section className="mb-8">
                <p className="text-sm font-medium text-purple-500">
                  Your day starts here
                </p>
  
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
                  Make today meaningful.
                </h1>
  
                <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
                  Stay focused on what matters, build consistent
                  habits, and make progress toward your goals.
                </p>
              </section>
  
              {/* Top cards */}
              <section className="grid gap-6 lg:grid-cols-3">
  
                {/* Focus */}
                <div className="rounded-3xl bg-purple-600 p-6 text-white shadow-sm">
                  <p className="text-sm font-medium text-purple-200">
                    Today&apos;s Focus
                  </p>
  
                  <h2 className="mt-4 text-2xl font-bold">
                    Finish the FlowDay project
                  </h2>
  
                  <p className="mt-3 text-sm leading-6 text-purple-100">
                    Keep your attention on the most important task
                    of your day.
                  </p>
  
                  <button
                    type="button"
                    className="mt-6 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-purple-600 transition hover:bg-purple-50"
                  >
                    Start Focus
                  </button>
                </div>
  
                {/* Progress */}
                <div className="rounded-3xl border border-gray-100 bg-white p-6">
                  <p className="text-sm font-medium text-gray-400">
                    Today&apos;s Progress
                  </p>
  
                  <div className="mt-5 flex items-end gap-2">
                    <span className="text-4xl font-bold text-gray-900">
                      68%
                    </span>
  
                    <span className="mb-1 text-sm text-gray-400">
                      completed
                    </span>
                  </div>
  
                  <div className="mt-5 h-3 overflow-hidden rounded-full bg-purple-50">
                    <div
                      className="h-full rounded-full bg-purple-500"
                      style={{ width: "68%" }}
                    />
                  </div>
  
                  <p className="mt-4 text-xs text-gray-400">
                    5 of 7 tasks completed today
                  </p>
                </div>
  
                {/* Focus time */}
                <div className="rounded-3xl border border-gray-100 bg-white p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-400">
                      Focus Time
                    </p>
  
                    <Clock3
                      size={20}
                      strokeWidth={1.8}
                      className="text-purple-500"
                    />
                  </div>
  
                  <div className="mt-5">
                    <span className="text-4xl font-bold text-gray-900">
                      1h 45m
                    </span>
                  </div>
  
                  <p className="mt-3 text-sm text-gray-400">
                    focused today
                  </p>
  
                  <div className="mt-6 flex items-center gap-2 text-sm text-green-500">
                    <TrendingUp size={16} strokeWidth={1.8} />
                    <span>Keep going!</span>
                  </div>
                </div>
              </section>
  
              {/* Tasks + Habits */}
              <section className="mt-8 grid gap-8 lg:grid-cols-2">
  
                {/* Tasks */}
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        Today&apos;s Tasks
                      </h2>
  
                      <p className="mt-1 text-xs text-gray-400">
                        What needs your attention today
                      </p>
                    </div>
  
                    <a
                      href="/tasks"
                      className="text-sm font-medium text-purple-600 hover:text-purple-700"
                    >
                      View all
                    </a>
                  </div>
  
                  <div className="space-y-3">
                    <TaskCard
                      title="Finish Next.js architecture"
                      category="Development"
                      priority="High"
                    />
  
                    <TaskCard
                      title="Design FlowDay dashboard"
                      category="Design"
                      priority="Medium"
                    />
  
                    <TaskCard
                      title="Review TypeScript notes"
                      category="Learning"
                      priority="Low"
                      completed
                    />
                  </div>
                </div>
  
                {/* Habits */}
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        Today&apos;s Habits
                      </h2>
  
                      <p className="mt-1 text-xs text-gray-400">
                        Build consistency one day at a time
                      </p>
                    </div>
  
                    <a
                      href="/habits"
                      className="text-sm font-medium text-purple-600 hover:text-purple-700"
                    >
                      View all
                    </a>
                  </div>
  
                  <div className="space-y-3">
                    <HabitCard
                      name="Read 20 minutes"
                      streak={12}
                      completed
                    />
  
                    <HabitCard
                      name="Drink enough water"
                      streak={7}
                      completed={false}
                    />
  
                    <HabitCard
                      name="Workout"
                      streak={5}
                      completed={false}
                    />
                  </div>
                </div>
              </section>
  
              {/* Goals */}
              <section className="mt-8">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Current Goals
                    </h2>
  
                    <p className="mt-1 text-xs text-gray-400">
                      Keep moving toward what matters
                    </p>
                  </div>
  
                  <a
                    href="/goals"
                    className="text-sm font-medium text-purple-600 hover:text-purple-700"
                  >
                    View all
                  </a>
                </div>
  
                <div className="grid gap-4 md:grid-cols-2">
                  <GoalCard
                    title="Master Next.js"
                    progress={72}
                    deadline="October 15"
                  />
  
                  <GoalCard
                    title="Build FlowDay MVP"
                    progress={45}
                    deadline="November 1"
                  />
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    );
  }
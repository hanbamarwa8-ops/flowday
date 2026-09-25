import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf9ff] px-6">
      <div className="max-w-xl text-center">
        <p className="mb-3 text-sm font-medium text-purple-600">
          Welcome to FlowDay
        </p>

        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Plan your day.
          <br />
          Build your habits.
          <br />
          Reach your goals.
        </h1>

        <p className="mx-auto mt-5 max-w-md text-gray-500">
          A calm and simple productivity space to organize your
          tasks, goals, habits and focus time.
        </p>

        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-700">
            Open Dashboard
          </Link>

          <Link
            href="/login"
            className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
            Login
          </Link>
        </div>
      </div>
    </main>
  );
}
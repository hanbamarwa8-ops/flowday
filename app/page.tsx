import Image from "next/image";
import Link from "next/link";
import {
  Timer,
  ListTodo,
  Target,
  Flame,
  ArrowRight,
  Check,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#faf9ff] text-gray-900">
      
      {/* ================= HEADER ================= */}
      <header className="border-b border-purple-100 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500 shadow-sm">
              <Timer
                size={21}
                strokeWidth={2}
                className="text-white"
              />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900">
                FlowDay
              </h1>

              <p className="text-[10px] font-medium text-gray-400">
                Plan. Focus. Grow.
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="#features"
              className="text-sm font-medium text-gray-500 transition hover:text-purple-600"
            >
              Features
            </Link>

            <Link
              href="#about"
              className="text-sm font-medium text-gray-500 transition hover:text-purple-600"
            >
              About
            </Link>
          </nav>

          {/* Header actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 sm:block"
            >
              Login
            </Link>

            <Link
              href="/signup"
              className="rounded-xl bg-purple-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-600"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>
{/* ================= HERO ================= */}
<section className="relative overflow-hidden">
  {/* Background decoration */}
  <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-purple-200/40 blur-3xl" />

  <div className="pointer-events-none absolute -right-32 top-40 h-80 w-80 rounded-full bg-blue-200/30 blur-3xl" />

  <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
    <div className="grid items-center gap-14 lg:grid-cols-2">

      {/* ================= LEFT CONTENT ================= */}
      <div className="max-w-xl">

        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-sm font-medium text-purple-600">
          <span className="h-2 w-2 rounded-full bg-purple-500" />

          Your calm productivity space
        </div>

        {/* Title */}
        <h2 className="text-5xl font-bold leading-[1.08] tracking-tight text-gray-900 lg:text-6xl">
          Plan your day.
          <br />

          <span className="text-purple-500">
            Build your habits.
          </span>

          <br />

          Reach your goals.
        </h2>

        {/* Description */}
        <p className="mt-6 max-w-lg text-lg leading-8 text-gray-500">
          FlowDay helps you organize your tasks, build consistent
          habits, track your goals and stay focused on what matters.
        </p>

        {/* Buttons */}
        <div className="mt-8 flex flex-wrap items-center gap-4">

          <Link
            href="/dashboard"
            className="group flex items-center gap-2 rounded-xl bg-purple-500 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-purple-200 transition hover:bg-purple-600"
          >
            Start planning

            <ArrowRight
              size={17}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>

          <Link
            href="#features"
            className="rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Explore FlowDay
          </Link>

        </div>

        {/* Benefits */}
        <div className="mt-8 flex flex-wrap gap-5">

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
              <Check
                size={14}
                strokeWidth={2.5}
                className="text-green-600"
              />
            </span>

            Simple to use
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
              <Check
                size={14}
                strokeWidth={2.5}
                className="text-green-600"
              />
            </span>

            Focus on what matters
          </div>

        </div>
      </div>

      {/* ================= MOTIVATIONAL IMAGE ================= */}
      <div className="relative">

{/* Soft glow behind image */}
<div className="pointer-events-none absolute -inset-5 rounded-[2.5rem] bg-purple-200/30 blur-3xl" />

{/* Image */}
<div className="relative overflow-hidden rounded-[2rem] border border-purple-100 bg-white p-3 shadow-xl shadow-purple-100/50">
  <Image
    src="/flowday-motivation.jpg"
    alt="FlowDay productivity and personal growth"
    width={1360}
    height={768}
    sizes="(max-width: 1024px) 100vw, 50vw"
    className="h-auto w-full rounded-[1.5rem] object-contain"
    priority
  />
</div>

{/* Floating focus card */}
<div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-purple-100 bg-white p-4 shadow-lg sm:block">
  <div className="flex items-center gap-3">

    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
      <Timer
        size={20}
        strokeWidth={1.8}
        className="text-purple-600"
      />
    </div>

    <div>
      <p className="text-xs text-gray-400">
        Stay focused
      </p>

      <p className="text-sm font-semibold text-gray-800">
        One step at a time
      </p>
    </div>

  </div>
</div>

</div>

    </div>
  </div>
</section>

  

      {/* ================= FEATURES ================= */}
      <section
        id="features"
        className="border-t border-purple-100 bg-white"
      >
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-purple-500">
              EVERYTHING IN ONE PLACE
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
              Everything you need to move forward
            </h2>

            <p className="mt-4 text-gray-500">
              FlowDay brings the essential parts of productivity
              together without making your day complicated.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            
            {/* Tasks */}
            <div className="rounded-2xl border border-gray-100 bg-[#faf9ff] p-6 transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100">
                <ListTodo
                  size={21}
                  className="text-purple-600"
                />
              </div>

              <h3 className="mt-5 font-semibold text-gray-800">
                Tasks
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Organize what needs to be done and keep your priorities
                clear.
              </p>
            </div>

            {/* Goals */}
            <div className="rounded-2xl border border-gray-100 bg-[#faf9ff] p-6 transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-100">
                <Target
                  size={21}
                  className="text-pink-600"
                />
              </div>

              <h3 className="mt-5 font-semibold text-gray-800">
                Goals
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Turn your bigger ambitions into clear and measurable
                progress.
              </p>
            </div>

            {/* Habits */}
            <div className="rounded-2xl border border-gray-100 bg-[#faf9ff] p-6 transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100">
                <Flame
                  size={21}
                  className="text-green-600"
                />
              </div>

              <h3 className="mt-5 font-semibold text-gray-800">
                Habits
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Build consistency through small actions repeated every
                day.
              </p>
            </div>

            {/* Focus */}
            <div className="rounded-2xl border border-gray-100 bg-[#faf9ff] p-6 transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
                <Timer
                  size={21}
                  className="text-blue-600"
                />
              </div>

              <h3 className="mt-5 font-semibold text-gray-800">
                Focus
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Give your attention to one thing at a time with focused
                sessions.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ================= ABOUT ================= */}
      <section
        id="about"
        className="bg-[#faf9ff]"
      >
        <div className="mx-auto max-w-4xl px-6 py-20 text-center lg:px-8">
          
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-purple-500 shadow-md shadow-purple-200">
            <Timer
              size={26}
              strokeWidth={2}
              className="text-white"
            />
          </div>

          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Productivity without the pressure
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-gray-500 leading-7">
            FlowDay is designed to help you make progress without
            overwhelming you. Plan your day, focus on what matters,
            develop better habits and gradually reach your goals.
          </p>

          <Link
            href="/dashboard"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-purple-500 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-purple-600"
          >
            Open FlowDay

            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-purple-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-sm text-gray-400 sm:flex-row lg:px-8">
          
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-500">
              <Timer
                size={14}
                className="text-white"
              />
            </div>

            <span className="font-semibold text-gray-700">
              FlowDay
            </span>
          </div>

          <p>
            Plan. Focus. Grow.
          </p>

          <p>
            © 2026 FlowDay
          </p>
        </div>
      </footer>

    </main>
  );
}
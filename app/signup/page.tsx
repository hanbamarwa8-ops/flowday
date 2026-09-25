import Image from "next/image";
import Link from "next/link";
import { Timer, ArrowLeft, Eye } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-[#faf9ff]">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-5 lg:px-8">

        {/* ================= HEADER ================= */}
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500 shadow-sm shadow-purple-200">
              <Timer
                size={21}
                strokeWidth={2}
                className="text-white"
              />
            </div>

            <span className="text-xl font-bold tracking-tight text-gray-900">
              FlowDay
            </span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-medium text-gray-500 transition hover:text-purple-600"
          >
            <ArrowLeft size={14} />
            Back to home
          </Link>
        </header>

        {/* ================= CONTENT ================= */}
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-[0_20px_60px_rgba(139,92,246,0.08)] lg:grid-cols-2">

            {/* ================= FORM ================= */}
            <section className="px-7 py-8 sm:px-12 sm:py-10 lg:px-14">
              <div className="mx-auto max-w-md">

                {/* Heading */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-purple-500">
                    Start your journey
                  </p>

                  <h1 className="mt-3 text-[2.1rem] font-bold tracking-tight text-gray-900">
                    Create your account
                  </h1>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Start organizing your day and building better habits.
                  </p>
                </div>

                {/* Form */}
                <form className="mt-7 space-y-4">

                  {/* Full name */}
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-xs font-semibold text-gray-700"
                    >
                      Full name
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Your name"
                      autoComplete="name"
                      className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-300 focus:border-purple-400 focus:ring-4 focus:ring-purple-50"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-xs font-semibold text-gray-700"
                    >
                      Email
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-300 focus:border-purple-400 focus:ring-4 focus:ring-purple-50"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-xs font-semibold text-gray-700"
                    >
                      Password
                    </label>

                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Create a password"
                        autoComplete="new-password"
                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 pr-11 text-sm text-gray-800 outline-none transition placeholder:text-gray-300 focus:border-purple-400 focus:ring-4 focus:ring-purple-50"
                      />

                      <button
                        type="button"
                        aria-label="Show password"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-purple-500"
                      >
                        <Eye size={17} />
                      </button>
                    </div>

                    <p className="mt-1.5 text-[11px] text-gray-400">
                      Use at least 8 characters.
                    </p>
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-2 block text-xs font-semibold text-gray-700"
                    >
                      Confirm password
                    </label>

                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Repeat your password"
                      autoComplete="new-password"
                      className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-300 focus:border-purple-400 focus:ring-4 focus:ring-purple-50"
                    />
                  </div>

                  {/* Terms */}
                  <div className="flex items-start gap-2.5 pt-1">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />

                    <label
                      htmlFor="terms"
                      className="text-[11px] leading-5 text-gray-500"
                    >
                      I agree to FlowDay&apos;s{" "}
                      <Link
                        href="#"
                        className="font-medium text-purple-600 hover:text-purple-700"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="#"
                        className="font-medium text-purple-600 hover:text-purple-700"
                      >
                        Privacy Policy
                      </Link>
                      .
                    </label>
                  </div>

                  {/* Sign up */}
                  <button
                    type="submit"
                    className="h-11 w-full rounded-xl bg-purple-500 text-sm font-semibold text-white shadow-sm shadow-purple-200 transition hover:bg-purple-600"
                  >
                    Sign up
                  </button>

                </form>

                {/* Divider */}
                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-gray-100" />

                  <span className="text-[11px] text-gray-400">
                    or continue with
                  </span>

                  <div className="h-px flex-1 bg-gray-100" />
                </div>

                {/* Social buttons */}
                <div className="grid grid-cols-2 gap-3">
  <button
    type="button"
    className="flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-600 transition hover:bg-gray-50"
  >
    <FcGoogle size={18} />
    <span>Google</span>
  </button>

  <button
    type="button"
    className="flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-600 transition hover:bg-gray-50"
  >
    <FaGithub size={18} className="text-gray-900" />
    <span>GitHub</span>
  </button>
                </div>

                {/* Login */}
                <p className="mt-6 text-center text-xs text-gray-500">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-purple-600 transition hover:text-purple-700"
                  >
                    Sign in
                  </Link>
                </p>

              </div>
            </section>

            {/* ================= ILLUSTRATION ================= */}
            <section className="relative hidden min-h-full overflow-hidden bg-[#f5f3ff] lg:flex lg:items-center lg:justify-center">

              {/* Background decoration */}
              <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-purple-200/40 blur-3xl" />

              <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />

              {/* Illustration */}
              <div className="relative flex w-full items-center justify-center px-10 py-12">

                <div className="relative w-full max-w-[500px] -translate-y-4">

                  {/* Image container */}
                  <div className="overflow-hidden rounded-[28px] bg-white p-4 shadow-[0_18px_45px_rgba(139,92,246,0.10)]">

                    <Image
                      src="/flowday-sign-up-improved.png"
                      alt="FlowDay productivity and goal setting"
                      width={1052}
                      height={748}
                      className="h-auto w-full rounded-[22px] object-contain"
                      priority
                    />

                  </div>

                  {/* Today's reminder */}
                  <div className="absolute bottom-7 left-8 rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-lg backdrop-blur-sm">
                    <p className="text-[10px] font-medium text-gray-400">
                      TODAY&apos;S REMINDER
                    </p>

                    <p className="mt-1 text-xs font-semibold text-gray-800">
                      One step at a time.
                    </p>
                  </div>

                </div>

              </div>

            </section>

          </div>
        </div>

        {/* Footer */}
        <p className="pb-2 text-center text-[10px] text-gray-400">
          Plan. Focus. Grow.
        </p>

      </div>
    </main>
  );
}
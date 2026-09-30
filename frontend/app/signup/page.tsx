"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Timer,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [terms, setTerms] = useState(false);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (
      !name.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError(
        "Please complete all required fields."
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!terms) {
      setError(
        "Please accept the Terms of Service and Privacy Policy."
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/signup`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to create your account."
        );
        return;
      }

      console.log(
        "Signup successful:",
        data.user
      );

      router.push("/dashboard");
    } catch (error) {
      console.error("Signup error:", error);

      setError(
        "Unable to connect to FlowDay. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

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

                <form
                  onSubmit={handleSubmit}
                  className="mt-7 space-y-4"
                >

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
                      value={name}
                      onChange={(event) =>
                        setName(event.target.value)
                      }
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
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
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
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        value={password}
                        onChange={(event) =>
                          setPassword(event.target.value)
                        }
                        placeholder="Create a password"
                        autoComplete="new-password"
                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 pr-11 text-sm text-gray-800 outline-none transition placeholder:text-gray-300 focus:border-purple-400 focus:ring-4 focus:ring-purple-50"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            (current) => !current
                          )
                        }
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-purple-500"
                      >
                        {showPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
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

                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(
                            event.target.value
                          )
                        }
                        placeholder="Repeat your password"
                        autoComplete="new-password"
                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 pr-11 text-sm text-gray-800 outline-none transition placeholder:text-gray-300 focus:border-purple-400 focus:ring-4 focus:ring-purple-50"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            (current) => !current
                          )
                        }
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-purple-500"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Terms */}

                  <div className="flex items-start gap-2.5 pt-1">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      checked={terms}
                      onChange={(event) =>
                        setTerms(event.target.checked)
                      }
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

                  {/* Error */}

                  {error && (
                    <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-5 text-red-600">
                      {error}
                    </div>
                  )}

                  {/* Sign up */}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="h-11 w-full rounded-xl bg-purple-500 text-sm font-medium text-white shadow-sm shadow-purple-200 transition hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading
                      ? "Creating account..."
                      : "Sign up"}
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
                    <FaGithub
                      size={18}
                      className="text-gray-900"
                    />
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

              <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-purple-200/40 blur-3xl" />

              <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />

              <div className="relative flex w-full items-center justify-center px-10 py-12">

                <div className="relative w-full max-w-[500px] -translate-y-4">

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
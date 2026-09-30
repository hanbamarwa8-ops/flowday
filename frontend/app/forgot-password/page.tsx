"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Timer } from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setError("");

    const formData = new FormData(event.currentTarget);

    const submittedEmail = String(
      formData.get("email") || ""
    ).trim();

    if (!submittedEmail) {
      setError("Please enter your email address.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/forgot-password`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: submittedEmail,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Something went wrong. Please try again."
        );

        return;
      }

      setMessage(
        data.message ||
          "If this account exists, a reset email has been sent."
      );

      setEmail("");
    } catch (error) {
      console.error(
        "Forgot password error:",
        error
      );

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
            href="/login"
            className="flex items-center gap-2 text-xs font-medium text-gray-500 transition hover:text-purple-600"
          >
            <ArrowLeft size={14} />
            Back to login
          </Link>
        </header>


        {/* ================= CONTENT ================= */}

        <div className="flex flex-1 items-center justify-center py-12">
          <section className="w-full max-w-md rounded-3xl border border-purple-100 bg-white px-7 py-9 shadow-[0_20px_60px_rgba(139,92,246,0.08)] sm:px-10">

            {/* Icon */}

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100">
              <Mail
                size={22}
                className="text-purple-600"
              />
            </div>


            {/* Heading */}

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-purple-500">
                Account recovery
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
                Forgot your password?
              </h1>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                Enter your email address and we&apos;ll send you
                a link to reset your password.
              </p>
            </div>


            {/* Form */}

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >

              {/* Email */}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-semibold text-gray-700"
                >
                  Email address
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


              {/* Success message */}

              {message && (
                <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm leading-5 text-green-700">
                  {message}
                </div>
              )}


              {/* Error message */}

              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-5 text-red-600">
                  {error}
                </div>
              )}


              {/* Submit */}

              <button
                type="submit"
                disabled={isLoading}
                className="h-11 w-full rounded-xl bg-purple-500 text-sm font-medium text-white shadow-sm shadow-purple-200 transition hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading
                  ? "Sending..."
                  : "Send reset link"}
              </button>

            </form>


            {/* Login */}

            <p className="mt-7 text-center text-sm text-gray-500">
              Remember your password?{" "}

              <Link
                href="/login"
                className="font-semibold text-purple-600 transition hover:text-purple-700"
              >
                Sign in
              </Link>
            </p>

          </section>
        </div>


        {/* Footer */}

        <p className="pb-2 text-center text-[10px] text-gray-400">
          Plan. Focus. Grow.
        </p>

      </div>
    </main>
  );
}
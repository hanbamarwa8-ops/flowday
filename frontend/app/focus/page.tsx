"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Pause,
  Play,
  RotateCcw,
  Timer,
} from "lucide-react";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import AuthGuard from "@/components/AuthGuard";

const FOCUS_DURATION = 25 * 60;

export default function FocusPage() {
  const [timeLeft, setTimeLeft] =
    useState(FOCUS_DURATION);

  const [isRunning, setIsRunning] =
    useState(false);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const interval = window.setInterval(() => {
      setTimeLeft((currentTime) => {
        if (currentTime <= 1) {
          setIsRunning(false);
          return 0;
        }

        return currentTime - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [isRunning]);

  function toggleTimer() {
    if (timeLeft === 0) {
      return;
    }

    setIsRunning((current) => !current);
  }

  function resetTimer() {
    setIsRunning(false);
    setTimeLeft(FOCUS_DURATION);
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const formattedTime =
    `${minutes.toString().padStart(2, "0")}:` +
    `${seconds.toString().padStart(2, "0")}`;

  const progress =
    ((FOCUS_DURATION - timeLeft) /
      FOCUS_DURATION) *
    100;

  return (
    <AuthGuard>
    <div className="flex min-h-screen bg-[#faf9ff]">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <main className="flex-1 px-6 py-8 lg:px-10">
          <div className="mx-auto max-w-6xl">

        {/* Header */}

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-purple-500">
              Stay focused
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
              Focus
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Give your attention to one thing at a time.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700"
          >
            <ArrowLeft size={15} />
            Dashboard
          </Link>
        </div>

        {/* Timer card */}

        <section className="mt-8 rounded-3xl border border-purple-100 bg-white p-8 shadow-[0_20px_60px_rgba(139,92,246,0.08)] sm:p-12">

          <div className="mx-auto max-w-xl text-center">

            {/* Icon */}

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100">
              <Timer
                size={26}
                className="text-purple-600"
              />
            </div>

            {/* Mode */}

            <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-purple-500">
              Focus session
            </p>

            {/* Timer */}

            <div className="mt-4">
              <p className="text-7xl font-semibold tracking-tight text-gray-900 sm:text-8xl">
                {formattedTime}
              </p>
            </div>

            {/* Progress */}

            <div className="mx-auto mt-7 h-2 max-w-md overflow-hidden rounded-full bg-purple-50">
              <div
                className="h-full rounded-full bg-purple-500 transition-all duration-500"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            {/* Status */}

            <p className="mt-4 text-sm text-gray-400">
              {timeLeft === 0
                ? "Focus session complete."
                : isRunning
                ? "Stay focused on the task in front of you."
                : "Ready when you are."}
            </p>

            {/* Controls */}

            <div className="mt-8 flex items-center justify-center gap-3">

              <button
                type="button"
                onClick={toggleTimer}
                disabled={timeLeft === 0}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-purple-500 px-6 text-sm font-medium text-white shadow-sm shadow-purple-200 transition hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isRunning ? (
                  <>
                    <Pause size={16} />
                    Pause
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    Start
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={resetTimer}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <RotateCcw size={16} />
                Reset
              </button>

            </div>

          </div>
        </section>

        </div>
        </main>
      </div>
    </div>
  </AuthGuard>
);
}
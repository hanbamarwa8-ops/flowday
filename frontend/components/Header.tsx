"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

type User = {
  name: string;
  email: string;
};

function getGreeting(hour: number) {
  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
}

function formatToday() {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null);

  const [greeting, setGreeting] =
    useState("");

  const [date, setDate] =
    useState("");

  useEffect(() => {
    const now = new Date();

    setGreeting(
      getGreeting(now.getHours())
    );

    setDate(formatToday());

    async function loadUser() {
      try {
        const response = await fetch(
          `${API_URL}/api/auth/me`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (data.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.error(
          "Unable to load user:",
          error
        );
      }
    }

    loadUser();
  }, []);

  return (
    <header className="flex h-20 items-center justify-between border-b border-gray-100 bg-white px-6 lg:px-8">
      <div>
        <p className="text-sm text-gray-400">
          {date}
        </p>

        <h2 className="mt-1 text-xl font-semibold text-gray-900">
          {greeting}
          {user?.name
            ? `, ${user.name}`
            : ""}
        </h2>
      </div>

      <button
        type="button"
        aria-label="Notifications"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 text-purple-600 transition hover:bg-purple-100"
      >
        <Bell
          size={19}
          strokeWidth={1.8}
        />
      </button>
    </header>
  );
}
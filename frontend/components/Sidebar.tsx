"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListTodo,
  Target,
  Flame,
  Timer,
  User,
} from "lucide-react";

import LogoutButton from "@/components/LogoutButton";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Tasks",
    href: "/tasks",
    icon: ListTodo,
  },
  {
    name: "Goals",
    href: "/goals",
    icon: Target,
  },
  {
    name: "Habits",
    href: "/habits",
    icon: Flame,
  },
  {
    name: "Focus",
    href: "/focus",
    icon: Timer,
  },
];

type UserData = {
  name: string;
  email: string;
};

export default function Sidebar() {
  const pathname = usePathname();

  const [user, setUser] =
    useState<UserData | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch(
          `${API_URL}/api/auth/me`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
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
          "Unable to load sidebar user:",
          error
        );
      }
    }

    loadUser();
  }, []);

  return (
    <aside className="hidden min-h-screen w-64 flex-col border-r border-purple-100 bg-white px-5 py-6 md:flex">

      {/* LOGO */}

      <div className="mb-10 px-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-3"
        >
          {/* Logo icon */}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500 shadow-sm">
            <Timer
              size={21}
              strokeWidth={2}
              className="text-white"
            />
          </div>

          {/* Logo text */}
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              FlowDay
            </h1>

            <p className="text-[10px] font-medium text-gray-400">
              Plan. Focus. Grow.
            </p>
          </div>
        </Link>
      </div>

      {/* NAVIGATION */}

      <nav className="flex-1 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;

          const isActive =
            pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-purple-100 text-purple-700"
                  : "text-gray-500 hover:bg-purple-50 hover:text-purple-600"
              }`}
            >
              <Icon
                size={20}
                strokeWidth={1.8}
              />

              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* USER + LOGOUT */}

      <div className="mt-6 rounded-2xl bg-purple-50 p-4">

        {/* User information */}

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-200 text-purple-700">
            <User
              size={20}
              strokeWidth={1.8}
            />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-800">
              {user?.name || "Loading..."}
            </p>

            <p className="text-xs text-gray-400">
              Free plan
            </p>
          </div>

        </div>

        {/* Separator */}

        <div className="my-4 h-px bg-purple-100" />

        {/* Logout */}

        <LogoutButton />

      </div>

    </aside>
  );
}
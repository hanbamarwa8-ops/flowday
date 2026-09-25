"use client";

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

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-64 flex-col border-r border-purple-100 bg-white px-5 py-6 md:flex">
      
      {/* Logo */}
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

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

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

      {/* User */}
      <div className="rounded-2xl bg-purple-50 p-4">
        <div className="flex items-center gap-3">
          
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-200 text-purple-700">
            <User
              size={20}
              strokeWidth={1.8}
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800">
              Marwa
            </p>

            <p className="text-xs text-gray-400">
              Free plan
            </p>
          </div>

        </div>
      </div>

    </aside>
  );
}
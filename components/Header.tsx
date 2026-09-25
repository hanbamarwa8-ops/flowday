import { Bell } from "lucide-react";

export default function Header() {
  return (
    <header className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4 lg:px-8">
      <div>
        <p className="text-sm text-gray-400">
          Tuesday, September 24
        </p>

        <h2 className="mt-1 text-xl font-semibold text-gray-800">
          Good evening, Yasmin
        </h2>
      </div>

      <button
        type="button"
        aria-label="Notifications"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 transition hover:bg-purple-200"
      >
        <Bell size={19} strokeWidth={1.8} />
      </button>
    </header>
  );
}
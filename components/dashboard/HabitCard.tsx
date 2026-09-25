import { Check, Flame } from "lucide-react";

type HabitCardProps = {
  name: string;
  streak: number;
  completed: boolean;
};

export default function HabitCard({
  name,
  streak,
  completed,
}: HabitCardProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 transition hover:shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
          <Flame size={20} strokeWidth={1.8} />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-800">
            {name}
          </h3>

          <p className="mt-1 text-xs text-gray-400">
            {streak} day streak
          </p>
        </div>
      </div>

      <button
        type="button"
        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
          completed
            ? "bg-green-100 text-green-600"
            : "bg-gray-100 text-gray-500"
        }`}
      >
        {completed && <Check size={13} strokeWidth={2} />}

        {completed ? "Done" : "Today"}
      </button>
    </div>
  );
}
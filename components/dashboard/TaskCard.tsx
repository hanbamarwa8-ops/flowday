import { Check } from "lucide-react";

type TaskCardProps = {
  title: string;
  category: string;
  priority: "High" | "Medium" | "Low";
  completed?: boolean;
};

export default function TaskCard({
  title,
  category,
  priority,
  completed = false,
}: TaskCardProps) {
  const priorityStyle = {
    High: "bg-pink-100 text-pink-600",
    Medium: "bg-yellow-100 text-yellow-700",
    Low: "bg-green-100 text-green-600",
  };

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-sm">
      <button
        type="button"
        aria-label={
          completed ? "Task completed" : "Mark task as completed"
        }
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
          completed
            ? "border-purple-500 bg-purple-500 text-white"
            : "border-gray-200"
        }`}
      >
        {completed && <Check size={14} strokeWidth={2.5} />}
      </button>

      <div className="min-w-0 flex-1">
        <h3
          className={`truncate text-sm font-semibold ${
            completed
              ? "text-gray-400 line-through"
              : "text-gray-800"
          }`}
        >
          {title}
        </h3>

        <p className="mt-1 text-xs text-gray-400">
          {category}
        </p>
      </div>

      <span
        className={`rounded-full px-3 py-1 text-xs font-medium ${priorityStyle[priority]}`}
      >
        {priority}
      </span>
    </div>
  );
}
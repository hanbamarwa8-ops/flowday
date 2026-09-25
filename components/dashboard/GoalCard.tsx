type GoalCardProps = {
  title: string;
  progress: number;
  deadline: string;
};

export default function GoalCard({
  title,
  progress,
  deadline,
}: GoalCardProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 transition hover:shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-gray-800">
            {title}
          </h3>

          <p className="mt-1 text-xs text-gray-400">
            Due {deadline}
          </p>
        </div>

        <span className="text-sm font-semibold text-purple-600">
          {progress}%
        </span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-purple-50">
        <div
          className="h-full rounded-full bg-purple-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
const ProgressTracker = ({
  label,
  helper,
  value = 0,
  max = 100,
  accent = "from-green-400 via-green-300 to-orange-400"
}) => {
  const percentage = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;

  return (
    <div className="rounded-2xl border border-white/6 bg-white/[0.03] p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
          <p className="text-sm font-medium text-white">
            {label}
          </p>
          {helper && (
            <p className="mt-1 text-xs text-gray-400">
              {helper}
            </p>
          )}
        </div>
        <p className="text-sm font-semibold text-white">
          {Math.min(value, max)}/{max}
        </p>
      </div>

      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/8">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${accent} shadow-[0_0_24px_rgba(34,197,94,0.35)] transition-all duration-700 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressTracker;

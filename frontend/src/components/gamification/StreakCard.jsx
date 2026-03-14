const FlameIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 3c1 2.5 4 3.4 4 7a4 4 0 01-8 0c0-1.9 1-3.2 2.2-4.5C11.3 4.5 11.8 3.8 12 3z" />
    <path d="M12 11c.5 1 2 1.8 2 3.6A2.6 2.6 0 019.4 16c0-1.3.7-2.2 1.5-3 .7-.7 1-1.2 1.1-2z" />
  </svg>
);

const StreakCard = ({ streak = 0, longestStreak = 0, dailyActivity = [] }) => {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/8 bg-[linear-gradient(145deg,rgba(31,41,55,0.92),rgba(17,24,39,0.88))] p-4 shadow-[0_24px_48px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.18),transparent_42%),radial-gradient(circle_at_top_right,rgba(249,115,22,0.2),transparent_34%)]" />

      <div className="relative flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-orange-300/80">
              Streak Engine
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Saving streak
            </h2>
            <p className="mt-2 max-w-md text-sm text-gray-300">
              Keep total income ahead of expenses to build daily momentum and unlock milestone rewards.
            </p>
          </div>

          <div className="relative self-start sm:self-auto">
            <div className="absolute inset-0 rounded-full bg-orange-500/30 blur-xl animate-pulse" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-orange-400/25 bg-orange-500/10 text-orange-300 shadow-[0_0_28px_rgba(249,115,22,0.3)] sm:h-16 sm:w-16">
              <FlameIcon />
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/8 bg-black/10 p-4 sm:p-5">
            <div className="flex flex-wrap items-end gap-2 sm:gap-3">
              <p className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                {streak}
              </p>
              <p className="pb-1 text-xs font-medium uppercase tracking-[0.18em] text-green-300 sm:pb-2 sm:text-sm sm:tracking-[0.22em]">
                Days live
              </p>
            </div>
            <div className="mt-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
                  Longest streak
                </p>
                <p className="mt-1 text-2xl font-semibold text-white">
                  {Math.max(streak, longestStreak)} days
                </p>
              </div>
              <div className="rounded-2xl border border-green-500/15 bg-green-500/10 px-4 py-3 text-left sm:text-right">
                <p className="text-xs uppercase tracking-[0.18em] text-green-200/80">
                  Status
                </p>
                <p className="mt-1 text-sm font-semibold text-green-300">
                  {streak > 0 ? "On track" : "Start today"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-4 sm:p-5">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-white">
                Daily activity
              </p>
              <p className="text-xs text-gray-400">
                Last {dailyActivity.length} days
              </p>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-1.5 sm:gap-2">
              {dailyActivity.map((day) => (
                <div key={day.key} className="text-center">
                  <div
                    className={`flex h-9 items-center justify-center rounded-xl border text-[11px] font-semibold transition sm:h-10 sm:rounded-2xl sm:text-xs ${
                      day.saved
                        ? "border-green-400/25 bg-green-500/15 text-green-200 shadow-[0_0_16px_rgba(34,197,94,0.18)]"
                        : day.active
                          ? "border-orange-400/20 bg-orange-500/10 text-orange-200"
                          : "border-white/6 bg-white/[0.03] text-gray-500"
                    }`}
                    title={`Income: Rs.${day.income} | Expense: Rs.${day.expense}`}
                  >
                    {day.dayNumber}
                  </div>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-gray-500">
                    {day.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreakCard;

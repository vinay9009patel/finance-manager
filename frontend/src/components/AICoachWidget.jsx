const coachCards = [
  {
    key: "tipOfDay",
    title: "Tip of the day",
    accent: "text-green-300",
    badge: "Daily"
  },
  {
    key: "weeklyInsight",
    title: "Weekly insight",
    accent: "text-orange-300",
    badge: "Week"
  },
  {
    key: "motivation",
    title: "Motivation",
    accent: "text-white",
    badge: "Coach"
  }
];

const AICoachWidget = ({ userName, insights }) => {
  return (
    <div className="rounded-[28px] border border-white/8 bg-gray-800/75 p-4 shadow-[0_24px_48px_rgba(0,0,0,0.26)] backdrop-blur-xl sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-green-300/80">
            AI Finance Coach
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Smart mentor for {userName || "your"} money habits
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Personalized guidance generated from your expenses, income, streak, badges, and budget pressure.
          </p>
        </div>

        <div className="rounded-2xl border border-green-500/15 bg-green-500/10 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-green-200/80">
            Coach mode
          </p>
          <p className="mt-1 text-sm font-semibold text-green-300">
            Live analysis active
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        {coachCards.map((card) => (
          <div
            key={card.key}
            className="group relative overflow-hidden rounded-3xl border border-white/8 bg-[linear-gradient(180deg,rgba(17,24,39,0.95),rgba(15,23,42,0.88))] p-4 shadow-[0_18px_35px_rgba(0,0,0,0.2)] transition hover:-translate-y-1 hover:border-green-500/15 sm:p-5"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.12),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.12),transparent_32%)] opacity-80" />
            <div className="relative">
              <div className="flex items-center justify-between gap-3">
                <p className={`text-sm font-semibold ${card.accent}`}>
                  {card.title}
                </p>
                <span className="rounded-full border border-white/8 bg-white/[0.05] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-gray-300">
                  {card.badge}
                </span>
              </div>

              <p className="mt-4 text-sm leading-6 text-gray-200">
                {insights?.[card.key]}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-orange-500/15 bg-orange-500/10 p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-orange-200/80">
          Coach radar
        </p>
        <p className="mt-2 text-sm text-orange-100">
          {insights?.warning}
        </p>
      </div>
    </div>
  );
};

export default AICoachWidget;

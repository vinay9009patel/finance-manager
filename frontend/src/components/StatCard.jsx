import CountUp from "react-countup";

const iconMap = {
  income: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M12 3v18" strokeLinecap="round" />
      <path d="M17 8.5c0-1.933-2.239-3.5-5-3.5s-5 1.567-5 3.5S9.239 12 12 12s5 1.567 5 3.5S14.761 19 12 19s-5-1.567-5-3.5" strokeLinecap="round" />
    </svg>
  ),
  expense: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M4 7h16" strokeLinecap="round" />
      <path d="M4 12h10" strokeLinecap="round" />
      <path d="M4 17h7" strokeLinecap="round" />
      <path d="M18 10v8" strokeLinecap="round" />
      <path d="M14 14h8" strokeLinecap="round" />
    </svg>
  ),
  balance: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M3 10.5 12 4l9 6.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v9h14v-9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 19v-5h6v5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  streak: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M12 3c2.5 3 4 5.2 4 8a4 4 0 1 1-8 0c0-2.8 1.5-5 4-8Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 14c1.4 1.2 2 2.3 2 3.5a2 2 0 1 1-4 0c0-1.2.6-2.3 2-3.5Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
};

const extractNumericValue = (value) => {
  const match = String(value).match(/-?\d+(\.\d+)?/g);
  if (!match) return null;
  return Number(match.join(""));
};

const renderAnimatedValue = (value) => {
  const numericValue = extractNumericValue(value);
  if (numericValue === null) {
    return value;
  }

  if (String(value).includes("Rs.")) {
    return (
      <>
        Rs.
        <CountUp end={numericValue} duration={1.2} separator="," />
      </>
    );
  }

  if (String(value).includes("Days")) {
    return (
      <>
        <CountUp end={numericValue} duration={1.2} separator="," /> Days
      </>
    );
  }

  return <CountUp end={numericValue} duration={1.2} separator="," />;
};

const StatCard = ({ title, value, icon, color, loading = false }) => {
  const renderedIcon = iconMap[icon] || icon;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/6 bg-[linear-gradient(180deg,rgba(17,24,39,0.96),rgba(15,23,42,0.9))] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.24)] transition duration-300 hover:-translate-y-1 hover:border-green-500/15 hover:shadow-[0_24px_52px_rgba(0,0,0,0.32)] sm:p-5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.12),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.1),transparent_32%)] opacity-80" />

      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">
              Overview
            </p>
            <h2 className="mt-2 text-sm font-medium text-gray-200">
              {title}
            </h2>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-cyan-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition duration-300 group-hover:scale-105 group-hover:border-green-400/20 group-hover:text-green-300 sm:h-11 sm:w-11">
            {renderedIcon}
          </div>
        </div>

        <div className={`mt-5 text-[1.7rem] font-bold tracking-tight sm:text-3xl ${color}`}>
          {loading ? (
            <div className="h-9 w-28 animate-pulse rounded-lg bg-white/8" />
          ) : (
            renderAnimatedValue(value)
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 text-xs">
          <span className="rounded-full border border-green-500/15 bg-green-500/10 px-2.5 py-1 text-green-300">
            Live metrics
          </span>
          <span className="text-gray-500">
            Updated just now
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;

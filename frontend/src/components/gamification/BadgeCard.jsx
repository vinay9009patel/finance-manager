const ICONS = {
  bronze: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3l2.6 5.26 5.8.85-4.2 4.08.99 5.77L12 16.9l-5.19 2.73.99-5.77-4.2-4.08 5.8-.85L12 3z" />
    </svg>
  ),
  silver: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 4l6 3.5v5c0 4-2.6 6.8-6 7.5-3.4-.7-6-3.5-6-7.5v-5L12 4z" />
      <path d="M9.5 12l1.6 1.6 3.4-3.6" />
    </svg>
  ),
  gold: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" />
      <path d="M8.5 12.5L7 20l5-2 5 2-1.5-7.5" />
    </svg>
  )
};

const BadgeCard = ({ badge }) => {
  const earnedLabel = badge.earnedAt
    ? new Date(badge.earnedAt).toLocaleDateString()
    : "Locked";

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border p-4 transition duration-300 ${
        badge.unlocked
          ? `${badge.ring} bg-gradient-to-br ${badge.accent} ${badge.glow} hover:-translate-y-1`
          : "border-white/6 bg-white/[0.03] opacity-70 hover:border-white/10 hover:opacity-90"
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_55%)] opacity-0 transition duration-300 group-hover:opacity-100" />

      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className={`inline-flex rounded-2xl border px-3 py-3 ${
            badge.unlocked ? "border-white/10 bg-white/10 text-white" : "border-white/8 bg-black/10 text-gray-400"
          }`}>
            {ICONS[badge.icon]}
          </div>
          <p className="mt-4 text-base font-semibold text-white">
            {badge.badgeName}
          </p>
          <p className="mt-1 text-sm text-gray-300">
            {badge.description}
          </p>
        </div>

        <span className={`self-start rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] ${
          badge.unlocked ? "bg-white/10 text-white" : "bg-white/6 text-gray-400"
        }`}>
          {badge.unlocked ? "Unlocked" : "Locked"}
        </span>
      </div>

      <p className="relative mt-4 text-xs text-gray-300">
        {badge.unlocked ? `Earned on ${earnedLabel}` : `${badge.threshold} day milestone`}
      </p>
    </div>
  );
};

export default BadgeCard;

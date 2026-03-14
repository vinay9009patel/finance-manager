import BadgeCard from "./BadgeCard";
import ProgressTracker from "./ProgressTracker";

const TimelineIcon = ({ type }) => {
  const map = {
    badge: "bg-orange-500/15 text-orange-300",
    streak: "bg-green-500/15 text-green-300",
    income: "bg-green-500/15 text-green-300",
    expense: "bg-orange-500/15 text-orange-300"
  };

  const symbols = {
    badge: "T",
    streak: "F",
    income: "+",
    expense: "-"
  };

  return (
    <div className={`flex h-9 w-9 items-center justify-center rounded-2xl border border-white/8 text-sm font-semibold ${map[type] || "bg-white/5 text-white"}`}>
      {symbols[type] || "."}
    </div>
  );
};

const RewardPanel = ({
  achievementBadges = [],
  progress,
  nextBadge,
  timeline = [],
  compact = false
}) => {
  const unlockedCount = achievementBadges.filter((item) => item.unlocked).length;

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-[28px] border border-white/8 bg-gray-800/75 p-4 shadow-[0_24px_48px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-green-300/80">
              Reward panel
            </p>
            <h3 className="mt-2 text-xl font-semibold text-white">
              Your achievements
            </h3>
          </div>
          <span className="rounded-full border border-orange-400/15 bg-orange-500/10 px-3 py-1 text-xs text-orange-300">
            {unlockedCount} earned
          </span>
        </div>

        <div className="mt-5 space-y-4">
          <ProgressTracker
            label={nextBadge ? `Next badge: ${nextBadge.badgeName}` : "All rewards unlocked"}
            helper={nextBadge ? `${Math.max(0, progress.targetValue - progress.currentValue)} day push to your next milestone` : "You have cleared every current streak milestone"}
            value={nextBadge ? progress.currentValue : progress.targetValue}
            max={progress.targetValue}
          />

          <div className={`grid gap-4 ${compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2"}`}>
            {achievementBadges.map((badge) => (
              <BadgeCard
                key={badge.badgeName}
                badge={badge}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/8 bg-gray-800/75 p-4 shadow-[0_24px_48px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-orange-300/80">
              Activity feed
            </p>
            <h3 className="mt-2 text-xl font-semibold text-white">
              Momentum timeline
            </h3>
          </div>
          <span className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-xs text-gray-300">
            {timeline.length} events
          </span>
        </div>

        <div className="mt-5 space-y-3">
          {timeline.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/8 bg-white/[0.03] p-6 text-center text-sm text-gray-400">
              Start logging income and expenses to unlock your first achievement trail.
            </div>
          )}

          {timeline.map((item) => (
            <div key={`${item.type}-${item.id}`} className="flex items-start gap-3 rounded-2xl border border-white/6 bg-white/[0.03] p-3 transition hover:border-green-500/15 hover:bg-white/[0.05] sm:gap-4 sm:p-4">
              <TimelineIcon type={item.type} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {item.subtitle}
                    </p>
                  </div>
                  <p className="text-[11px] text-gray-500 sm:whitespace-nowrap">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RewardPanel;

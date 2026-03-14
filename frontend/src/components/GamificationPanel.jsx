import RewardPanel from "./gamification/RewardPanel";
import StreakCard from "./gamification/StreakCard";
import {
  getAchievementBadges,
  getAchievementTimeline,
  getDailySavingActivity,
  getLongestSavingStreak,
  getProgressToNextBadge
} from "../utils/gamification";

const GamificationPanel = ({
  streak = 0,
  badges = [],
  expenses = [],
  incomes = [],
  compact = false
}) => {
  const achievementBadges = getAchievementBadges(badges);
  const dailyActivity = getDailySavingActivity(incomes, expenses, compact ? 7 : 14);
  const longestStreak = getLongestSavingStreak(incomes, expenses);
  const progress = getProgressToNextBadge(streak);
  const timeline = getAchievementTimeline({
    incomes,
    expenses,
    badges,
    streak
  });

  return (
    <div className="space-y-6">
      <StreakCard
        streak={streak}
        longestStreak={longestStreak}
        dailyActivity={dailyActivity}
      />

      <RewardPanel
        achievementBadges={achievementBadges}
        progress={progress}
        nextBadge={progress.nextBadge}
        timeline={timeline}
        compact={compact}
      />
    </div>
  );
};

export default GamificationPanel;

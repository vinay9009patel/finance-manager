import { buildCoachInsights } from "./aiCoachService";
import {
  getAchievementBadges,
  getAchievementTimeline,
  getDailySavingActivity,
  getLongestSavingStreak,
  getProgressToNextBadge,
  normalizeBadges
} from "../utils/gamification";

export const buildGamificationSnapshot = ({
  streak = 0,
  badges = [],
  expenses = [],
  incomes = []
}) => {
  const normalizedBadges = normalizeBadges(badges);
  const achievementBadges = getAchievementBadges(normalizedBadges);
  const longestStreak = getLongestSavingStreak(incomes, expenses);
  const progress = getProgressToNextBadge(streak);
  const dailyActivity = getDailySavingActivity(incomes, expenses, 14);
  const timeline = getAchievementTimeline({
    incomes,
    expenses,
    badges: normalizedBadges,
    streak
  });
  const unlockedCount = achievementBadges.filter((badge) => badge.unlocked).length;
  const activeSavingDays = dailyActivity.filter((day) => day.saved).length;

  return {
    normalizedBadges,
    achievementBadges,
    longestStreak,
    progress,
    dailyActivity,
    timeline,
    unlockedCount,
    activeSavingDays,
    nextBadge: progress.nextBadge,
    remainingDays: progress.nextBadge
      ? Math.max(0, progress.nextBadge.threshold - streak)
      : 0
  };
};

export const buildGamificationExperience = ({
  userName,
  streak = 0,
  badges = [],
  expenses = [],
  incomes = [],
  budget = 0,
  categoryBudgets = [],
  dashboardData = {}
}) => {
  const snapshot = buildGamificationSnapshot({
    streak,
    badges,
    expenses,
    incomes
  });

  return {
    ...snapshot,
    coachInsights: buildCoachInsights({
      userName,
      expenses,
      incomes,
      streak,
      budget,
      categoryBudgets,
      dashboardData
    })
  };
};

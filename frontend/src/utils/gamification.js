export const BADGE_CATALOG = [
  {
    badgeName: "Bronze Saver",
    description: "Saved money for 3 days",
    threshold: 3,
    icon: "bronze",
    accent: "from-orange-400/30 via-amber-300/10 to-transparent",
    ring: "border-orange-400/25",
    glow: "shadow-[0_18px_40px_rgba(249,115,22,0.18)]"
  },
  {
    badgeName: "Silver Saver",
    description: "Saved money for 7 days",
    threshold: 7,
    icon: "silver",
    accent: "from-slate-300/30 via-white/10 to-transparent",
    ring: "border-slate-200/25",
    glow: "shadow-[0_18px_40px_rgba(226,232,240,0.12)]"
  },
  {
    badgeName: "Gold Saver",
    description: "Saved money for 30 days",
    threshold: 30,
    icon: "gold",
    accent: "from-yellow-300/35 via-orange-300/10 to-transparent",
    ring: "border-yellow-300/25",
    glow: "shadow-[0_18px_40px_rgba(250,204,21,0.18)]"
  }
];

const getDateKey = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    .toISOString()
    .slice(0, 10);
};

const buildDailyTotals = (incomes = [], expenses = []) => {
  const map = new Map();

  incomes.forEach((item) => {
    const key = getDateKey(item.createdAt || item.date || Date.now());
    const current = map.get(key) || { income: 0, expense: 0 };
    current.income += Number(item.amount) || 0;
    map.set(key, current);
  });

  expenses.forEach((item) => {
    const key = getDateKey(item.createdAt || item.date || Date.now());
    const current = map.get(key) || { income: 0, expense: 0 };
    current.expense += Number(item.amount) || 0;
    map.set(key, current);
  });

  return map;
};

export const normalizeBadges = (badges = []) => {
  const seen = new Set();

  return badges.filter((badge) => {
    const key = badge.badgeName || badge._id;
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

export const getAchievementBadges = (badges = []) => {
  const earnedBadges = normalizeBadges(badges);

  return BADGE_CATALOG.map((item) => {
    const unlocked = earnedBadges.find((badge) => badge.badgeName === item.badgeName);
    return {
      ...item,
      unlocked: Boolean(unlocked),
      earnedAt: unlocked?.createdAt || null,
      description: unlocked?.description || item.description
    };
  });
};

export const getNextBadge = (streak = 0) =>
  BADGE_CATALOG.find((item) => streak < item.threshold) || null;

export const getProgressToNextBadge = (streak = 0) => {
  const nextBadge = getNextBadge(streak);

  if (!nextBadge) {
    return {
      nextBadge: null,
      percentage: 100,
      currentValue: streak,
      targetValue: BADGE_CATALOG[BADGE_CATALOG.length - 1].threshold
    };
  }

  const currentIndex = BADGE_CATALOG.findIndex((item) => item.badgeName === nextBadge.badgeName);
  const previousThreshold = currentIndex > 0 ? BADGE_CATALOG[currentIndex - 1].threshold : 0;
  const span = Math.max(1, nextBadge.threshold - previousThreshold);

  return {
    nextBadge,
    percentage: Math.max(0, Math.min(100, ((streak - previousThreshold) / span) * 100)),
    currentValue: streak - previousThreshold,
    targetValue: span
  };
};

export const getDailySavingActivity = (incomes = [], expenses = [], windowSize = 14) => {
  const totals = buildDailyTotals(incomes, expenses);
  const today = new Date();
  const days = [];

  for (let index = windowSize - 1; index >= 0; index -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - index);
    const key = getDateKey(date);
    const totalsForDay = totals.get(key) || { income: 0, expense: 0 };
    const saved = totalsForDay.income > totalsForDay.expense;
    const active = totalsForDay.income > 0 || totalsForDay.expense > 0;

    days.push({
      key,
      label: date.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 1),
      dayNumber: date.getDate(),
      income: totalsForDay.income,
      expense: totalsForDay.expense,
      saved,
      active
    });
  }

  return days;
};

export const getLongestSavingStreak = (incomes = [], expenses = []) => {
  const totals = buildDailyTotals(incomes, expenses);
  const sortedKeys = Array.from(totals.keys()).sort((left, right) => left.localeCompare(right));

  let longest = 0;
  let current = 0;
  let previousDate = null;

  sortedKeys.forEach((key) => {
    const totalsForDay = totals.get(key);
    const date = new Date(`${key}T00:00:00`);
    const isSavingDay = totalsForDay.income > totalsForDay.expense;

    if (!isSavingDay) {
      current = 0;
      previousDate = date;
      return;
    }

    const diffDays = previousDate
      ? Math.round((date.getTime() - previousDate.getTime()) / 86400000)
      : null;

    current = diffDays === 1 ? current + 1 : 1;
    longest = Math.max(longest, current);
    previousDate = date;
  });

  return longest;
};

export const getAchievementTimeline = ({
  incomes = [],
  expenses = [],
  badges = [],
  streak = 0
}) => {
  const badgeEvents = normalizeBadges(badges).map((badge) => ({
    id: badge._id || badge.badgeName,
    type: "badge",
    title: `${badge.badgeName} unlocked`,
    subtitle: badge.description || "New achievement earned",
    createdAt: badge.createdAt || new Date().toISOString()
  }));

  const incomeEvents = incomes.map((item) => ({
    id: item._id,
    type: "income",
    title: item.source || "Income added",
    subtitle: `Income logged: Rs.${item.amount}`,
    createdAt: item.createdAt || item.date || new Date().toISOString()
  }));

  const expenseEvents = expenses.map((item) => ({
    id: item._id,
    type: "expense",
    title: item.category || item.title || "Expense added",
    subtitle: `Expense tracked: Rs.${item.amount}`,
    createdAt: item.createdAt || item.date || new Date().toISOString()
  }));

  const streakEvent = streak > 0 ? [{
    id: `streak-${streak}`,
    type: "streak",
    title: `${streak} day saving streak`,
    subtitle: "Current streak is active",
    createdAt: new Date().toISOString()
  }] : [];

  return [...badgeEvents, ...incomeEvents, ...expenseEvents, ...streakEvent]
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
    .slice(0, 6);
};

export const isAchievementNotification = (item) => {
  const text = `${item?.title || ""} ${item?.message || ""}`;
  return /badge|streak|reward|saver|achievement|unlocked|champion/i.test(text);
};

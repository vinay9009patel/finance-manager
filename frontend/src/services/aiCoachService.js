import { BADGE_CATALOG } from "../utils/gamification";

const getFirstName = (name = "there") => String(name).trim().split(" ")[0] || "there";
const currency = (value = 0) => `Rs.${Math.round(Number(value) || 0).toLocaleString()}`;

const getDateKey = (value) => {
  const date = new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString().slice(0, 10);
};

const sumAmounts = (items = []) =>
  items.reduce((total, item) => total + (Number(item.amount) || 0), 0);

const filterRange = (items = [], start, end) =>
  items.filter((item) => {
    const date = new Date(item.createdAt || item.date || Date.now());
    return date >= start && date <= end;
  });

const getTodayStats = (expenses = [], incomes = []) => {
  const todayKey = getDateKey(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = getDateKey(yesterday);

  const todayExpenses = expenses.filter((item) => getDateKey(item.createdAt || item.date || Date.now()) === todayKey);
  const todayIncomes = incomes.filter((item) => getDateKey(item.createdAt || item.date || Date.now()) === todayKey);
  const yesterdayExpenses = expenses.filter((item) => getDateKey(item.createdAt || item.date || Date.now()) === yesterdayKey);
  const yesterdayIncomes = incomes.filter((item) => getDateKey(item.createdAt || item.date || Date.now()) === yesterdayKey);

  return {
    todayExpense: sumAmounts(todayExpenses),
    todayIncome: sumAmounts(todayIncomes),
    yesterdayExpense: sumAmounts(yesterdayExpenses),
    yesterdayIncome: sumAmounts(yesterdayIncomes),
    todayExpenses
  };
};

const getWeekWindow = (offset = 0) => {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = (day + 6) % 7;
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(now.getDate() - diffToMonday - (offset * 7));
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const getWeeklyStats = (expenses = [], incomes = []) => {
  const currentWeek = getWeekWindow(0);
  const previousWeek = getWeekWindow(1);

  const currentExpenses = filterRange(expenses, currentWeek.start, currentWeek.end);
  const currentIncomes = filterRange(incomes, currentWeek.start, currentWeek.end);
  const previousExpenses = filterRange(expenses, previousWeek.start, previousWeek.end);
  const previousIncomes = filterRange(incomes, previousWeek.start, previousWeek.end);

  return {
    currentExpense: sumAmounts(currentExpenses),
    currentIncome: sumAmounts(currentIncomes),
    previousExpense: sumAmounts(previousExpenses),
    previousIncome: sumAmounts(previousIncomes),
    currentExpenses
  };
};

const getTopCategory = (expenses = []) => {
  const bucket = expenses.reduce((acc, item) => {
    const key = item.category || "other";
    acc[key] = (acc[key] || 0) + (Number(item.amount) || 0);
    return acc;
  }, {});

  const [category, amount] = Object.entries(bucket).sort((left, right) => right[1] - left[1])[0] || [];
  return category ? { category, amount } : null;
};

const getNextBadge = (streak = 0) => BADGE_CATALOG.find((item) => streak < item.threshold) || null;

const getBudgetPressure = (categoryBudgets = []) => (
  [...categoryBudgets]
    .filter((item) => Number(item.budgetAmount) > 0)
    .sort((left, right) => (Number(right.percentUsed) || 0) - (Number(left.percentUsed) || 0))[0] || null
);

export const generateDailyInsight = ({
  userName,
  expenses = [],
  incomes = [],
  streak = 0,
  budget = 0,
  categoryBudgets = []
}) => {
  const name = getFirstName(userName);
  const today = getTodayStats(expenses, incomes);
  const todayNet = today.todayIncome - today.todayExpense;
  const yesterdayNet = today.yesterdayIncome - today.yesterdayExpense;
  const topCategory = getTopCategory(today.todayExpenses);
  const budgetPressure = getBudgetPressure(categoryBudgets);

  if (today.todayIncome > 0 && todayNet > yesterdayNet) {
    return `Proud of you ${name}! You saved ${currency(todayNet - Math.max(yesterdayNet, 0))} more today than yesterday.`;
  }

  if (topCategory && today.todayExpense > 0 && topCategory.amount / today.todayExpense >= 0.45) {
    const share = Math.round((topCategory.amount / today.todayExpense) * 100);
    return `${name}, ${share}% of today's spending went to ${topCategory.category}. Keep an eye on that category.`;
  }

  if (budget > 0 && today.todayExpense > budget * 0.35) {
    return `${name}, today's expenses already used a big share of your monthly budget. Slow down before the month gets tight.`;
  }

  if (budgetPressure && budgetPressure.percentUsed >= 80) {
    return `${name}, you have used ${Math.round(budgetPressure.percentUsed)}% of your ${budgetPressure.category} budget. Stay careful in that category.`;
  }

  if (streak > 0) {
    return `Great discipline ${name}. Your ${streak} day saving streak is giving you real momentum.`;
  }

  return `Nice work ${name}. Keep logging expenses and income so your coach can spot stronger money patterns.`;
};

export const generateWeeklySummary = ({
  userName,
  expenses = [],
  incomes = [],
  budget = 0,
  categoryBudgets = []
}) => {
  const name = getFirstName(userName);
  const weekly = getWeeklyStats(expenses, incomes);
  const topCategory = getTopCategory(weekly.currentExpenses);
  const net = weekly.currentIncome - weekly.currentExpense;
  const budgetPressure = getBudgetPressure(categoryBudgets);

  if (weekly.currentExpense === 0 && weekly.currentIncome === 0) {
    return `${name}, this week is still quiet. Add transactions regularly so I can coach you better.`;
  }

  if (budget > 0 && weekly.currentExpense > budget * 0.7) {
    return `Warning ${name}: this week alone has consumed a large part of your monthly budget.`;
  }

  if (budgetPressure && budgetPressure.percentUsed >= 90) {
    return `${name}, your ${budgetPressure.category} budget is already at ${Math.round(budgetPressure.percentUsed)}%. Consider reducing spend there this week.`;
  }

  if (topCategory && weekly.currentExpense > 0) {
    const share = Math.round((topCategory.amount / weekly.currentExpense) * 100);
    return `${name}, your top spending category this week is ${topCategory.category} at ${share}% of weekly expenses.`;
  }

  if (net >= 0) {
    return `Nice balance ${name}. This week your income is ahead of expenses by ${currency(net)}.`;
  }

  return `${name}, your expenses are ahead of income by ${currency(Math.abs(net))} this week. Tighten spending before that gap grows.`;
};

export const generatePraiseMessage = ({
  userName,
  previousSummary = {},
  currentSummary = {},
  streak = 0,
  badgeName = ""
}) => {
  const name = getFirstName(userName);

  if (badgeName) {
    return `Excellent work ${name}! You unlocked the ${badgeName} badge.`;
  }

  if ((currentSummary.totalIncome || 0) > (previousSummary.totalIncome || 0)) {
    return `Great job ${name}! New income added, and your cash flow just got healthier.`;
  }

  if (streak > (previousSummary.streak || 0)) {
    return `Keep it up ${name}! Your saving streak just moved to ${streak} days.`;
  }

  return `Nice work ${name}. Your consistency is building stronger financial habits.`;
};

export const generateWarningMessage = ({
  userName,
  expenses = [],
  incomes = [],
  budget = 0,
  currentSummary = {},
  categoryBudgets = []
}) => {
  const name = getFirstName(userName);
  const weekly = getWeeklyStats(expenses, incomes);
  const topCategory = getTopCategory(weekly.currentExpenses);
  const totalExpense = currentSummary.totalExpense || sumAmounts(expenses);
  const totalIncome = currentSummary.totalIncome || sumAmounts(incomes);
  const budgetPressure = getBudgetPressure(categoryBudgets);

  if (budget > 0 && totalExpense > budget) {
    return `Warning ${name}: you have exceeded your budget. Review discretionary spending today.`;
  }

  if (budgetPressure?.exceeded) {
    return `Warning ${name}: your ${budgetPressure.category} spending has exceeded the category budget.`;
  }

  if (budgetPressure && budgetPressure.percentUsed >= 80) {
    return `${name}, your ${budgetPressure.category} budget is almost full at ${Math.round(budgetPressure.percentUsed)}%.`;
  }

  if (totalIncome > 0 && totalExpense / totalIncome >= 0.9) {
    return `${name}, your expenses are getting very close to your income. Protect your margin before it disappears.`;
  }

  if (topCategory && topCategory.category === "shopping") {
    return `${name}, shopping spend is leading this week. Consider a tighter cap before it snowballs.`;
  }

  if (weekly.currentExpense > weekly.previousExpense && weekly.previousExpense > 0) {
    return `${name}, your weekly spending is rising compared with last week. A quick reset now can help.`;
  }

  return `${name}, keep watching high-frequency spending categories so small purchases do not eat your balance.`;
};

export const generateMotivationMessage = ({
  userName,
  streak = 0
}) => {
  const name = getFirstName(userName);
  const nextBadge = getNextBadge(streak);

  if (!nextBadge) {
    return `${name}, you have cleared every current streak milestone. Maintain the habit and keep compounding wins.`;
  }

  const remaining = Math.max(0, nextBadge.threshold - streak);
  return `Keep going ${name}! Stay on track for ${remaining} more day${remaining === 1 ? "" : "s"} to unlock ${nextBadge.badgeName}.`;
};

export const buildCoachInsights = ({
  userName,
  expenses = [],
  incomes = [],
  streak = 0,
  budget = 0,
  categoryBudgets = [],
  dashboardData = {}
}) => ({
  tipOfDay: generateDailyInsight({
    userName,
    expenses,
    incomes,
    streak,
    budget,
    categoryBudgets
  }),
  weeklyInsight: generateWeeklySummary({
    userName,
    expenses,
    incomes,
    budget,
    categoryBudgets
  }),
  motivation: generateMotivationMessage({
    userName,
    streak
  }),
  warning: generateWarningMessage({
    userName,
    expenses,
    incomes,
    budget,
    categoryBudgets,
    currentSummary: dashboardData
  })
});

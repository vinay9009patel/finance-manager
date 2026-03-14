import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { getExpenses } from "../services/expenseService";
import { getIncomes } from "../services/incomeService";
import { getAnalyticsSummary } from "../services/analyticsService";
import { getBadges } from "../services/badgeService";
import GamificationPanel from "../components/GamificationPanel";
import AICoachWidget from "../components/AICoachWidget";
import { getCurrentUser, getMonthKey } from "../utils/helper";
import { buildGamificationExperience } from "../services/gamificationService";
import { getBudgetStatus } from "../services/budgetService";
import { formatCategoryLabel } from "../utils/categories";

const COLORS = [
  "#22c55e",
  "#f97316",
  "#3b82f6",
  "#a855f7",
  "#eab308",
  "#14b8a6",
  "#ef4444",
  "#6366f1"
];

const resolveItemDate = (item) => item.createdAt || item.date || "1970-01-01T00:00:00.000Z";
const chartCardClassName = "rounded-[28px] border border-white/8 bg-gray-800/75 p-4 shadow-[0_20px_45px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:p-6";
const legendStyle = {
  color: "#d1d5db",
  fontSize: 12
};

const renderEmptyChartState = (title, description) => (
  <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-white/8 bg-white/[0.03] px-6 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-green-500/20 bg-green-500/10 text-lg font-semibold text-green-200">
      {title.slice(0, 1)}
    </div>
    <p className="mt-4 text-base font-medium text-white">
      {title}
    </p>
    <p className="mt-2 max-w-sm text-sm leading-6 text-gray-400">
      {description}
    </p>
  </div>
);

const Analytics = () => {
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    streak: 0
  });
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [badges, setBadges] = useState([]);
  const [categoryBudgets, setCategoryBudgets] = useState([]);
  const [overallBudget, setOverallBudget] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const user = getCurrentUser();

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");

    const [summaryResult, expenseResult, incomeResult, badgeResult, budgetResult] = await Promise.allSettled([
      getAnalyticsSummary(),
      getExpenses(),
      getIncomes(),
      getBadges(),
      getBudgetStatus(getMonthKey())
    ]);

    if (summaryResult.status === "fulfilled") {
      setSummary({
        totalIncome: summaryResult.value?.totalIncome || 0,
        totalExpense: summaryResult.value?.totalExpense || 0,
        balance: summaryResult.value?.balance || 0,
        streak: summaryResult.value?.streak || summaryResult.value?.savingStreak || 0
      });
    } else {
      setSummary({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        streak: 0
      });
      setError(summaryResult.reason?.response?.data?.message || "Unable to load analytics data");
    }

    if (expenseResult.status === "fulfilled") {
      setExpenses(expenseResult.value || []);
    } else {
      setExpenses([]);
    }

    if (incomeResult.status === "fulfilled") {
      setIncomes(incomeResult.value || []);
    } else {
      setIncomes([]);
    }

    if (badgeResult.status === "fulfilled") {
      setBadges(badgeResult.value || []);
    } else {
      setBadges([]);
    }

    if (budgetResult.status === "fulfilled") {
      setCategoryBudgets(budgetResult.value?.categoryBudgets || []);
      setOverallBudget(Number(budgetResult.value?.overallBudget?.budgetAmount) || 0);
    } else {
      setCategoryBudgets([]);
      setOverallBudget(0);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadAnalytics();
    }, 0);

    const handleFocus = () => {
      loadAnalytics();
    };
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadAnalytics();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadAnalytics]);

  const gamification = useMemo(() => buildGamificationExperience({
    userName: user?.name,
    streak: summary.streak,
    badges,
    expenses,
    incomes,
    budget: overallBudget,
    categoryBudgets,
    dashboardData: summary
  }), [badges, categoryBudgets, expenses, incomes, overallBudget, summary, user?.name]);

  const categorySpending = useMemo(() => {
    const map = expenses.reduce((acc, item) => {
      const category = item.category || "other";
      acc[category] = (acc[category] || 0) + (Number(item.amount) || 0);
      return acc;
    }, {});

    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const monthlySpending = useMemo(() => {
    const map = expenses.reduce((acc, item) => {
      const dt = new Date(resolveItemDate(item));
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
      acc[key] = (acc[key] || 0) + (Number(item.amount) || 0);
      return acc;
    }, {});

    return Object.entries(map)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, amount]) => ({ month, amount }));
  }, [expenses]);

  const incomeVsExpense = useMemo(() => {
    const expenseByMonth = expenses.reduce((acc, item) => {
      const dt = new Date(resolveItemDate(item));
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
      acc[key] = (acc[key] || 0) + (Number(item.amount) || 0);
      return acc;
    }, {});

    const incomeByMonth = incomes.reduce((acc, item) => {
      const dt = new Date(resolveItemDate(item));
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
      acc[key] = (acc[key] || 0) + (Number(item.amount) || 0);
      return acc;
    }, {});

    const keys = Array.from(new Set([
      ...Object.keys(expenseByMonth),
      ...Object.keys(incomeByMonth)
    ])).sort();

    return keys.map((month) => ({
      month,
      income: incomeByMonth[month] || 0,
      expense: expenseByMonth[month] || 0
    }));
  }, [expenses, incomes]);

  const budgetVsActual = useMemo(() => (
    categoryBudgets.map((item) => ({
      category: formatCategoryLabel(item.category),
      budget: Number(item.budgetAmount) || 0,
      spent: Number(item.spent) || 0
    }))
  ), [categoryBudgets]);

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <h1 className="text-2xl font-bold">
        Analytics
      </h1>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl bg-gray-800 p-4 shadow sm:p-6">
          <p className="text-sm text-gray-400">Total Income</p>
          <p className="text-2xl font-bold mt-1 text-green-400">Rs.{summary.totalIncome}</p>
        </div>

        <div className="rounded-xl bg-gray-800 p-4 shadow sm:p-6">
          <p className="text-sm text-gray-400">Total Expense</p>
          <p className="text-2xl font-bold mt-1 text-orange-400">Rs.{summary.totalExpense}</p>
        </div>

        <div className="rounded-xl bg-gray-800 p-4 shadow sm:p-6">
          <p className="text-sm text-gray-400">Balance</p>
          <p className="text-2xl font-bold mt-1 text-white">Rs.{summary.balance}</p>
        </div>

        <div className="rounded-xl bg-gray-800 p-4 shadow sm:p-6">
          <p className="text-sm text-gray-400">Saving Streak</p>
          <p className="text-2xl font-bold mt-1 text-green-400">{summary.streak} Days</p>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-green-300/80">
              Gamification Insights
            </p>
            <h2 className="text-xl font-semibold text-white">
              Streak and achievement performance
            </h2>
          </div>
          <p className="text-sm text-gray-400">
            Live stats from your streak engine, unlocked badges, and activity history.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/6 bg-gray-800/70 p-4 shadow">
            <p className="text-xs uppercase tracking-[0.18em] text-green-300/80">
              Unlocked badges
            </p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {gamification.unlockedCount}
            </p>
            <p className="mt-2 text-sm text-gray-400">
              {gamification.achievementBadges.length - gamification.unlockedCount} remaining milestones
            </p>
          </div>

          <div className="rounded-2xl border border-white/6 bg-gray-800/70 p-4 shadow">
            <p className="text-xs uppercase tracking-[0.18em] text-orange-300/80">
              Longest streak
            </p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {gamification.longestStreak} days
            </p>
            <p className="mt-2 text-sm text-gray-400">
              {gamification.activeSavingDays} saving days in the recent activity window
            </p>
          </div>

          <div className="rounded-2xl border border-white/6 bg-gray-800/70 p-4 shadow">
            <p className="text-xs uppercase tracking-[0.18em] text-green-300/80">
              Next milestone
            </p>
            <p className="mt-2 text-xl font-semibold text-white">
              {gamification.nextBadge ? gamification.nextBadge.badgeName : "All rewards unlocked"}
            </p>
            <p className="mt-2 text-sm text-gray-400">
              {gamification.nextBadge
                ? `${gamification.remainingDays} more day${gamification.remainingDays === 1 ? "" : "s"} needed`
                : "You have completed the current streak rewards ladder."}
            </p>
          </div>
        </div>

        <GamificationPanel
          streak={summary.streak}
          badges={badges}
          expenses={expenses}
          incomes={incomes}
          compact
        />
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-orange-300/80">
            AI Coach
          </p>
          <h2 className="text-xl font-semibold text-white">
            Achievement-aware financial guidance
          </h2>
        </div>

        <AICoachWidget
          userName={user?.name}
          insights={gamification.coachInsights}
        />
      </section>

      <div className="rounded-xl bg-gray-800 p-4 shadow sm:p-6">
        <h2 className="text-lg font-semibold mb-4">Budget vs Actual Spending</h2>
        <p className="mb-4 text-sm text-gray-400">
          Compare each category budget with real spend for this month.
        </p>
        <div className="h-72 sm:h-80">
          {!loading && budgetVsActual.length === 0
            ? renderEmptyChartState(
              "No budget data yet",
              "Set category budgets first. Once you add food, travel, shopping, or other limits, this comparison chart will appear here."
            )
            : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetVsActual} barGap={10}>
                  <XAxis dataKey="category" stroke="#9ca3af" tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.04)" }}
                    contentStyle={{
                      background: "#111827",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 16,
                      color: "#fff"
                    }}
                  />
                  <Legend formatter={(value) => value === "budget" ? "Budget" : "Actual Spend"} wrapperStyle={legendStyle} />
                  <Bar dataKey="budget" fill="#22c55e" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="spent" fill="#f97316" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className={chartCardClassName}>
          <h2 className="text-lg font-semibold mb-4">Category Spending</h2>
          <p className="mb-4 text-sm text-gray-400">
            See where most of your expenses are going right now.
          </p>
          <div className="h-64 sm:h-72">
            {!loading && categorySpending.length === 0
              ? renderEmptyChartState(
                "No expense categories yet",
                "Add a few expenses and this chart will break down spending across food, travel, shopping, and other categories."
              )
              : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categorySpending}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={88}
                      innerRadius={42}
                      paddingAngle={3}
                      labelLine={false}
                    >
                      {categorySpending.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "#111827",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 16,
                        color: "#fff"
                      }}
                    />
                    <Legend wrapperStyle={legendStyle} />
                  </PieChart>
                </ResponsiveContainer>
              )}
          </div>
        </div>

        <div className={chartCardClassName}>
          <h2 className="text-lg font-semibold mb-4">Monthly Spending</h2>
          <p className="mb-4 text-sm text-gray-400">
            Track how your expense trend moves month by month.
          </p>
          <div className="h-64 sm:h-72">
            {!loading && monthlySpending.length === 0
              ? renderEmptyChartState(
                "No monthly expense trend",
                "Once you start adding expenses across dates, this line chart will show the spending pattern over time."
              )
              : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlySpending}>
                    <XAxis dataKey="month" stroke="#9ca3af" tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "#111827",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 16,
                        color: "#fff"
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#f97316"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#f97316" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
          </div>
        </div>
      </div>

      <div className={chartCardClassName}>
        <h2 className="text-lg font-semibold mb-4">Income vs Expense</h2>
        <p className="mb-4 text-sm text-gray-400">
          Compare monthly cash coming in versus money going out.
        </p>
        <div className="h-64 sm:h-72">
          {!loading && incomeVsExpense.length === 0
            ? renderEmptyChartState(
              "No income vs expense history",
              "Add both income and expense entries to compare how your monthly cash flow is trending."
            )
            : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomeVsExpense} barGap={10}>
                  <XAxis dataKey="month" stroke="#9ca3af" tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "#111827",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 16,
                      color: "#fff"
                    }}
                  />
                  <Legend formatter={(value) => value === "income" ? "Income" : "Expense"} wrapperStyle={legendStyle} />
                  <Bar dataKey="income" fill="#22c55e" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="expense" fill="#f97316" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;

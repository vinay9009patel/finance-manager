import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import StatCard from "../components/StatCard";
import Chart from "../components/Chart";
import ActivityPanel from "../components/ActivityPanel";
import ExpenseTable from "../components/ExpenseTable";
import AddExpenseModal from "../components/AddExpenseModal";
import GamificationPanel from "../components/GamificationPanel";
import AICoachWidget from "../components/AICoachWidget";
import useDashboardData from "../hooks/useDashboardData";
import { deleteExpense } from "../services/expenseService";
import { linkStudent } from "../services/authService";
import { getCurrentUser, isParentAccount } from "../utils/helper";
import toast from "react-hot-toast";
import { addNotification } from "../utils/notificationStore";
import { normalizeBadges } from "../utils/gamification";
import { buildGamificationExperience } from "../services/gamificationService";
import { CATEGORY_META, formatCategoryLabel } from "../utils/categories";

const Dashboard = () => {
  const [openModal, setOpenModal] = useState(false);
  const [childEmail, setChildEmail] = useState("");
  const [childCode, setChildCode] = useState("");
  const [linking, setLinking] = useState(false);
  const [highlightedChild, setHighlightedChild] = useState("");
  const { loading, dashboardData, expenses, incomes, refresh } = useDashboardData();
  const user = getCurrentUser();

  const monthlyBudget = dashboardData.monthlyBudget || 0;
  const gamification = useMemo(() => buildGamificationExperience({
    userName: user?.name,
    expenses,
    incomes,
    streak: dashboardData.streak,
    budget: monthlyBudget,
    categoryBudgets: dashboardData.categoryBudgets,
    dashboardData
  }), [dashboardData, expenses, incomes, monthlyBudget, user?.name]);

  useEffect(() => {
    if (!loading && monthlyBudget > 0 && dashboardData.totalExpense > monthlyBudget) {
      toast.error("Budget exceeded for this month");
      addNotification({
        title: "Budget exceeded",
        message: `Spent Rs.${dashboardData.totalExpense} > budget Rs.${monthlyBudget}`,
        type: "budget"
      });
    }
  }, [loading, monthlyBudget, dashboardData.totalExpense]);

  const activities = useMemo(() => {
    const badgeActivities = normalizeBadges(dashboardData.badges || []).map((item) => ({
      id: item._id || item.badgeName,
      type: "badge",
      title: `Badge: ${item.badgeName}`,
      amount: "Unlocked",
      color: "text-orange-300",
      createdAt: new Date(item.createdAt || Date.now())
    }));

    const expenseActivities = expenses.map((item) => ({
      id: item._id,
      type: "expense",
      title: `Expense: ${item.category}`,
      amount: `- Rs.${item.amount}`,
      color: "text-orange-400",
      createdAt: new Date(item.createdAt || item.date || Date.now())
    }));

    const incomeActivities = incomes.map((item) => ({
      id: item._id,
      type: "income",
      title: `Income: ${item.source}`,
      amount: `+ Rs.${item.amount}`,
      color: "text-green-400",
      createdAt: new Date(item.createdAt || item.date || Date.now())
    }));

    const streakActivities = dashboardData.streak > 0 ? [{
      id: `streak-${dashboardData.streak}`,
      type: "streak",
      title: "Saving streak active",
      amount: `${dashboardData.streak} days`,
      color: "text-green-300",
      createdAt: new Date()
    }] : [];

    const timeline = [...badgeActivities, ...expenseActivities, ...incomeActivities, ...streakActivities]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 6)
      .map((item) => ({
        ...item,
        date: item.createdAt.toLocaleDateString()
      }));

    if (monthlyBudget > 0 && dashboardData.totalExpense > monthlyBudget) {
      timeline.unshift({
        id: "budget-alert",
        type: "alert",
        title: "Budget alert",
        amount: `Limit Rs.${monthlyBudget} crossed`,
        color: "text-red-400",
        date: new Date().toLocaleDateString()
      });
    }

    return timeline;
  }, [expenses, incomes, monthlyBudget, dashboardData.badges, dashboardData.streak, dashboardData.totalExpense]);

  const handleDeleteExpense = async (id) => {
    if (!id) return;

    try {
      await deleteExpense(id);
      toast.success("Expense deleted");
      addNotification({
        title: "Expense deleted",
        message: "An expense was removed",
        type: "expense"
      });
      await refresh();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete expense");
    }
  };

  const handleLinkStudent = async () => {
    if (!childEmail.trim() && !childCode.trim()) {
      toast.error("Enter student email or secure student ID");
      return;
    }

    setLinking(true);
    try {
      await linkStudent({
        childEmail: childEmail.trim() || undefined,
        childCode: childCode.trim().toUpperCase() || undefined
      });
      toast.success("Student linked successfully");
      setHighlightedChild(childCode.trim().toUpperCase() || childEmail.trim().toLowerCase());
      setChildEmail("");
      setChildCode("");
      await refresh();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to connect student");
    } finally {
      setLinking(false);
    }
  };

  return(
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">
          Dashboard
        </h1>

        <button
          onClick={() => setOpenModal(true)}
          className="bg-green-500 px-4 py-2 rounded-lg hover:bg-green-600"
        >
          + Add Expense
        </button>
      </div>

      {loading && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-gray-800 p-6 rounded-xl shadow animate-pulse h-28"></div>
          ))}
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Income"
            value={`Rs.${dashboardData.totalIncome}`}
            icon="income"
            color="text-green-400"
          />

          <StatCard
            title="Total Expenses"
            value={`Rs.${dashboardData.totalExpense}`}
            icon="expense"
            color="text-orange-400"
          />

          <StatCard
            title="Balance"
            value={`Rs.${dashboardData.balance}`}
            icon="balance"
            color="text-white"
          />

          <StatCard
            title="Saving Streak"
            value={`${dashboardData.streak || 0} Days`}
            icon="streak"
            color="text-green-400"
          />
        </div>
      )}

      {!loading && (
        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-green-300/80">
                Streak Engine
              </p>
              <h2 className="text-xl font-semibold text-white">
                Your achievements
              </h2>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-gray-300">
              <span className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1">
                {gamification.unlockedCount} badges unlocked
              </span>
              <span className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1">
                Longest streak {gamification.longestStreak} days
              </span>
              <span className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1">
                {gamification.nextBadge ? `${gamification.remainingDays} days to ${gamification.nextBadge.badgeName}` : "All milestones reached"}
              </span>
            </div>
          </div>

          <GamificationPanel
            streak={dashboardData.streak}
            badges={dashboardData.badges}
            expenses={expenses}
            incomes={incomes}
          />
        </section>
      )}

      {!loading && (
        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-orange-300/80">
                Category Budgets
              </p>
              <h2 className="text-xl font-semibold text-white">
                Spending against each limit
              </h2>
            </div>
            <Link
              to="/budget"
              className="text-sm text-green-300 transition hover:text-green-200"
            >
              Manage budgets
            </Link>
          </div>

          <div className="rounded-[28px] border border-white/8 bg-gray-800/70 p-4 shadow-[0_24px_48px_rgba(0,0,0,0.26)] backdrop-blur-xl sm:p-6">
            {dashboardData.categoryBudgets?.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {dashboardData.categoryBudgets.map((item) => {
                  const meta = CATEGORY_META[item.category] || CATEGORY_META.other;
                  const percent = Math.max(0, Math.min(100, Number(item.percentUsed) || 0));

                  return (
                    <div key={item._id || item.category} className="rounded-3xl border border-white/8 bg-white/[0.03] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${item.exceeded ? "border-red-500/20 bg-red-500/10 text-red-200" : item.warning ? "border-orange-500/20 bg-orange-500/10 text-orange-200" : "border-green-500/20 bg-green-500/10 text-green-200"}`}>
                            {meta.icon}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">
                              {formatCategoryLabel(item.category)}
                            </p>
                            <p className="text-xs text-gray-400">
                              Rs.{item.spent} / Rs.{item.budgetAmount}
                            </p>
                          </div>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-[11px] ${item.exceeded ? "bg-red-500/15 text-red-200" : item.warning ? "bg-orange-500/15 text-orange-200" : "bg-green-500/15 text-green-200"}`}>
                          {Math.round(percent)}%
                        </span>
                      </div>

                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/8">
                        <div
                          className={`h-full rounded-full transition-all ${item.exceeded ? "bg-red-400" : item.warning ? "bg-orange-400" : "bg-green-400"}`}
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                      </div>

                      <p className="mt-3 text-xs text-gray-400">
                        {item.exceeded
                          ? `Exceeded by Rs.${Math.abs(item.remaining)}`
                          : `Remaining Rs.${Math.max(0, item.remaining)}`}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-white/8 bg-white/[0.03] px-6 py-10 text-center">
                <p className="text-base font-medium text-white">
                  No category budgets yet
                </p>
                <p className="mt-2 text-sm text-gray-400">
                  Add food, travel, shopping, or other limits to start budget tracking.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {!loading && (
        <section className="space-y-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-orange-300/80">
              AI Coach
            </p>
            <h2 className="text-xl font-semibold text-white">
              Finance mentor insights
            </h2>
          </div>

          <AICoachWidget
            userName={user?.name}
            insights={gamification.coachInsights}
          />
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Chart expenses={expenses} />
        <div className="space-y-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-green-300/80">
              Activity Timeline
            </p>
            <h2 className="text-xl font-semibold text-white">
              Live money events
            </h2>
          </div>
          <ActivityPanel activities={activities} loading={loading} />
        </div>
      </div>

      <ExpenseTable
        expenses={expenses}
        onDelete={handleDeleteExpense}
      />

      {isParentAccount(user) && (
        <div className="rounded-xl bg-gray-800 p-4 shadow sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              Parent Monitoring
            </h2>
            <span className="text-sm text-gray-400">
              {dashboardData.linkedChildren?.length || 0} students
            </span>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto]">
            <input
              type="email"
              value={childEmail}
              onChange={(e) => setChildEmail(e.target.value)}
              placeholder="Enter student email"
              className="bg-gray-700 p-3 rounded"
            />

            <input
              type="text"
              value={childCode}
              onChange={(e) => setChildCode(e.target.value.toUpperCase())}
              placeholder="Or enter secure student ID"
              className="bg-gray-700 p-3 rounded"
            />

            <button
              type="button"
              onClick={handleLinkStudent}
              disabled={linking}
              className="bg-cyan-500 px-4 py-3 rounded hover:bg-cyan-600"
            >
              {linking ? "Connecting..." : "Connect"}
            </button>
          </div>

          {(!dashboardData.linkedChildren || dashboardData.linkedChildren.length === 0) && (
            <p className="text-sm text-gray-400">
              No student linked yet. Enter a student email or secure student ID to activate child view.
            </p>
          )}

          {dashboardData.linkedChildren?.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dashboardData.linkedChildren.map((child) => (
                <div
                  key={child._id}
                  className={`rounded-lg p-4 transition ${
                    highlightedChild &&
                    (child.studentCode === highlightedChild || child.email?.toLowerCase() === highlightedChild)
                      ? "bg-green-500/10 ring-1 ring-green-400/30 shadow-[0_0_0_1px_rgba(74,222,128,0.1)]"
                      : "bg-gray-700"
                  }`}
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">
                        {child.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {child.email}
                      </p>
                      {child.studentCode && (
                        <p className="text-[11px] text-green-300 mt-1">
                          ID: {child.studentCode}
                        </p>
                      )}
                    </div>

                    <Link
                      to={`/children/${child._id}`}
                      className="text-xs bg-cyan-500 text-white px-3 py-1 rounded hover:bg-cyan-600"
                    >
                      Child View
                    </Link>
                  </div>

                  <div className="mb-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                    <div>
                      <p className="text-gray-400">Income</p>
                      <p className="text-green-400 font-semibold">Rs.{child.totalIncome}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Expense</p>
                      <p className="text-orange-400 font-semibold">Rs.{child.totalExpense}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Balance</p>
                      <p className="text-white font-semibold">Rs.{child.balance}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-300 mb-2">
                      Recent expenses
                    </p>

                    {child.recentExpenses?.length ? (
                      <div className="space-y-2">
                        {child.recentExpenses.map((item) => (
                          <div key={item._id} className="flex items-center justify-between text-xs border-b border-gray-600 pb-2">
                            <div>
                              <p className="capitalize text-white">
                                {item.category}
                              </p>
                              <p className="text-gray-400">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <p className="text-orange-400 font-semibold">
                              Rs.{item.amount}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">
                        No expenses yet.
                      </p>
                    )}
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-gray-300 mb-2">
                      Recent incomes
                    </p>

                    {child.recentIncomes?.length ? (
                      <div className="space-y-2">
                        {child.recentIncomes.map((item) => (
                          <div key={item._id} className="flex items-center justify-between text-xs border-b border-gray-600 pb-2">
                            <div>
                              <p className="capitalize text-white">
                                {item.source}
                              </p>
                              <p className="text-gray-400">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <p className="text-green-400 font-semibold">
                              Rs.{item.amount}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">
                        No incomes yet.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <AddExpenseModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onExpenseAdded={refresh}
      />
    </div>
  );
};

export default Dashboard;

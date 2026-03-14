import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { getAnalyticsSummary } from "../services/analyticsService";
import { getDashboardData } from "../services/dashboardService";
import { getExpenses } from "../services/expenseService";
import { getIncomes } from "../services/incomeService";
import { getBadges } from "../services/badgeService";
import { addNotification } from "../utils/notificationStore";
import { normalizeBadges } from "../utils/gamification";
import { getCurrentUser, getMonthKey } from "../utils/helper";
import {
  generateDailyInsight,
  generatePraiseMessage,
  generateWarningMessage
} from "../services/aiCoachService";
import { getBudgetStatus } from "../services/budgetService";

const useDashboardData = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    streak: 0,
    linkedChildren: [],
    badges: [],
    categoryBudgets: []
  });
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const previousGamificationRef = useRef({
    initialized: false,
    streak: 0,
    badges: [],
    monthlyBudget: 0,
    categoryWarnings: [],
    totalIncome: 0,
    totalExpense: 0
  });

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [summary, dashboard, expenseList, incomeList, badges, budgetStatus] = await Promise.all([
        getAnalyticsSummary(),
        getDashboardData(),
        getExpenses(),
        getIncomes(),
        getBadges(),
        getBudgetStatus(getMonthKey())
      ]);

      setDashboardData({
        totalIncome: dashboard?.totalIncome || summary?.totalIncome || 0,
        totalExpense: dashboard?.totalExpense || summary?.totalExpense || 0,
        balance: dashboard?.balance || summary?.balance || 0,
        streak: summary?.streak || 0,
        linkedChildren: dashboard?.linkedChildren || [],
        badges: badges || [],
        monthlyBudget: Number(budgetStatus?.overallBudget?.budgetAmount) || 0,
        categoryBudgets: budgetStatus?.categoryBudgets || []
      });
      setExpenses(expenseList);
      setIncomes(incomeList);

      const nextBadgeNames = normalizeBadges(badges || []).map((item) => item.badgeName);
      const currentUser = getCurrentUser();
      const monthBudget = Number(budgetStatus?.overallBudget?.budgetAmount) || 0;
      const categoryBudgets = budgetStatus?.categoryBudgets || [];
      const categoryWarningKeys = categoryBudgets
        .filter((item) => item.warning)
        .map((item) => `${item.category}:${item.exceeded ? "exceeded" : "warning"}`);

      if (previousGamificationRef.current.initialized) {
        const newBadges = normalizeBadges(badges || []).filter(
          (item) => !previousGamificationRef.current.badges.includes(item.badgeName)
        );

        newBadges.forEach((badge) => {
          const message = generatePraiseMessage({
            userName: currentUser?.name,
            badgeName: badge.badgeName
          });
          toast.success(message);
          addNotification({
            title: "New badge unlocked",
            message,
            type: "achievement"
          });
        });

        if ((summary?.streak || 0) > previousGamificationRef.current.streak) {
          const message = generatePraiseMessage({
            userName: currentUser?.name,
            previousSummary: previousGamificationRef.current,
            currentSummary: summary,
            streak: summary?.streak || 0
          });
          toast.success(message);
          addNotification({
            title: "Saving streak updated",
            message,
            type: "achievement"
          });
        }

        if ((summary?.totalIncome || 0) > previousGamificationRef.current.totalIncome) {
          const message = generatePraiseMessage({
            userName: currentUser?.name,
            previousSummary: previousGamificationRef.current,
            currentSummary: summary,
            streak: summary?.streak || 0
          });
          addNotification({
            title: "AI Finance Coach",
            message,
            type: "ai"
          });
        }

        if ((summary?.totalExpense || 0) > previousGamificationRef.current.totalExpense) {
          const advice = generateDailyInsight({
            userName: currentUser?.name,
            expenses: expenseList,
            incomes: incomeList,
            streak: summary?.streak || 0,
            budget: monthBudget,
            categoryBudgets
          });
          addNotification({
            title: "AI Finance Coach",
            message: advice,
            type: "ai"
          });
        }

        if (
          monthBudget > 0 &&
          (summary?.totalExpense || 0) > monthBudget &&
          previousGamificationRef.current.totalExpense <= monthBudget
        ) {
          const warning = generateWarningMessage({
            userName: currentUser?.name,
            expenses: expenseList,
            incomes: incomeList,
            budget: monthBudget,
            currentSummary: summary,
            categoryBudgets
          });
          addNotification({
            title: "AI Finance Coach",
            message: warning,
            type: "ai"
          });
        }

        const newCategoryWarnings = categoryBudgets.filter((item) => (
          item.warning &&
          !previousGamificationRef.current.categoryWarnings.includes(`${item.category}:${item.exceeded ? "exceeded" : "warning"}`)
        ));

        newCategoryWarnings.forEach((item) => {
          const warning = generateWarningMessage({
            userName: currentUser?.name,
            expenses: expenseList,
            incomes: incomeList,
            budget: monthBudget,
            currentSummary: summary,
            categoryBudgets: [item]
          });

          toast.error(warning);
          addNotification({
            title: "Budget alert",
            message: warning,
            type: "budget"
          });
        });
      }

      previousGamificationRef.current = {
        initialized: true,
        streak: summary?.streak || 0,
        badges: nextBadgeNames,
        categoryWarnings: categoryWarningKeys,
        totalIncome: summary?.totalIncome || 0,
        totalExpense: summary?.totalExpense || 0
      };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    loading,
    dashboardData,
    expenses,
    incomes,
    refresh,
    setExpenses
  };
};

export default useDashboardData;

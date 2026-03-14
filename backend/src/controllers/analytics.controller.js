import Income from "../models/Income.model.js";
import Expense from "../models/Expense.model.js";
import { updateSavingStreak } from "../services/streak.service.js";
import { checkBadges } from "../services/badge.service.js";

const calculateAnalytics = async (userId) => {
  const incomes = await Income.find({
    user: userId
  });

  const expenses = await Expense.find({
    user: userId
  });

  const totalIncome = incomes.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const totalExpense = expenses.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const balance = totalIncome - totalExpense;
  const streak = await updateSavingStreak(
    userId,
    totalIncome,
    totalExpense
  );

  await checkBadges(userId, streak);

  return {
    totalIncome,
    totalExpense,
    balance,
    streak,
    savingStreak: streak
  };
};

export const getSummary = async (req, res) => {

  try {
    const analytics = await calculateAnalytics(req.user._id);

    res.json(analytics);

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    });

  }

};

export const getAnalytics = async (req, res) => {
  try {
    const analytics = await calculateAnalytics(req.user._id);

    return res.json(analytics);
  } catch (error) {
    return res.status(500).json({
      message: "Unable to load analytics data"
    });
  }
};

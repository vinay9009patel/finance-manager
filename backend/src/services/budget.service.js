import Budget from "../models/Budget.model.js";
import Expense from "../models/Expense.model.js";

export const OVERALL_BUDGET_CATEGORY = "overall";

export const normalizeBudgetCategory = (value) =>
  String(value || OVERALL_BUDGET_CATEGORY).trim().toLowerCase();

export const getMonthRange = (month) => {
  const start = new Date(`${month}-01T00:00:00.000Z`);
  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + 1);
  return { start, end };
};

const toBudgetSummary = (budget, spent) => {
  const budgetAmount = Number(budget?.budgetAmount ?? budget?.amount ?? 0);
  const remaining = budgetAmount - spent;
  const percentUsed = budgetAmount > 0 ? Number(((spent / budgetAmount) * 100).toFixed(2)) : 0;

  return {
    _id: budget?._id || null,
    category: normalizeBudgetCategory(budget?.category),
    month: budget?.month || "",
    budgetAmount,
    amount: budgetAmount,
    spent,
    remaining,
    percentUsed,
    warning: percentUsed >= 80,
    exceeded: spent > budgetAmount && budgetAmount > 0,
    createdAt: budget?.createdAt || null,
    updatedAt: budget?.updatedAt || null
  };
};

export const getExpenseTotalsForMonth = async ({ userId, month }) => {
  const { start, end } = getMonthRange(month);

  const grouped = await Expense.aggregate([
    {
      $match: {
        user: userId,
        createdAt: {
          $gte: start,
          $lt: end
        }
      }
    },
    {
      $group: {
        _id: "$category",
        spent: { $sum: "$amount" }
      }
    }
  ]);

  const categoryTotals = grouped.reduce((acc, item) => {
    acc[normalizeBudgetCategory(item._id)] = Number(item.spent) || 0;
    return acc;
  }, {});

  const totalSpent = Object.values(categoryTotals).reduce((sum, value) => sum + value, 0);

  return {
    categoryTotals,
    totalSpent
  };
};

export const getCategoryBudgetSummary = async ({ userId, month, category }) => {
  const normalizedCategory = normalizeBudgetCategory(category);
  const budget = await Budget.findOne({
    user: userId,
    month,
    category: normalizedCategory
  });

  if (!budget) {
    return null;
  }

  const { categoryTotals, totalSpent } = await getExpenseTotalsForMonth({ userId, month });
  const spent = normalizedCategory === OVERALL_BUDGET_CATEGORY
    ? totalSpent
    : Number(categoryTotals[normalizedCategory]) || 0;

  return toBudgetSummary(budget, spent);
};

export const getBudgetSummariesForMonth = async ({ userId, month }) => {
  const budgets = await Budget.find({
    user: userId,
    month
  }).sort({ category: 1, updatedAt: -1 });

  const { categoryTotals, totalSpent } = await getExpenseTotalsForMonth({ userId, month });

  return budgets.map((budget) => {
    const category = normalizeBudgetCategory(budget.category);
    const spent = category === OVERALL_BUDGET_CATEGORY
      ? totalSpent
      : Number(categoryTotals[category]) || 0;

    return toBudgetSummary(budget, spent);
  });
};

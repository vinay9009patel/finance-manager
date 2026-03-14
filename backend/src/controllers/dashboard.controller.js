import Income from "../models/Income.model.js";
import Expense from "../models/Expense.model.js";
import User from "../models/User.model.js";

const isParentAccount = (user) =>
  user?.role === "parent" || (user?.role === "adult" && user?.isParent === true);

const buildFinanceSummary = async (userId) => {
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

  const categoryTotals = {};

  expenses.forEach((exp) => {
    if (!categoryTotals[exp.category]) {
      categoryTotals[exp.category] = 0;
    }

    categoryTotals[exp.category] += exp.amount;
  });

  const recentExpenses = expenses
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);

  const recentIncomes = incomes
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);

  return {
    totalIncome,
    totalExpense,
    balance,
    categoryTotals,
    recentExpenses,
    recentIncomes
  };
};

const buildChildDetailPayload = async (child) => {
  const summary = await buildFinanceSummary(child._id);

  const incomes = await Income.find({
    user: child._id
  }).sort({ createdAt: -1 });

  const expenses = await Expense.find({
    user: child._id
  }).sort({ createdAt: -1 });

  return {
    child: {
      _id: child._id,
      name: child.name,
      email: child.email
    },
    ...summary,
    incomes,
    expenses
  };
};

export const getDashboardData = async (req, res) => {

  try {
    const summary = await buildFinanceSummary(req.user._id);
    let linkedChildren = [];

    if (isParentAccount(req.user)) {
      const children = await User.find({
        linkedParent: req.user._id,
        role: { $in: ["student", "child"] },
        isParent: { $ne: true }
      }).select("-password");

      linkedChildren = await Promise.all(
        children.map(async (child) => {
          const childSummary = await buildFinanceSummary(child._id);

          return {
            _id: child._id,
            name: child.name,
            email: child.email,
            studentCode: child.studentCode || null,
            totalIncome: childSummary.totalIncome,
            totalExpense: childSummary.totalExpense,
            balance: childSummary.balance,
            recentExpenses: childSummary.recentExpenses,
            recentIncomes: childSummary.recentIncomes
          };
        })
      );
    }

    res.json({
      ...summary,
      linkedChildren
    });

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    });

  }

};

export const getLinkedChildDetails = async (req, res) => {
  try {
    if (!isParentAccount(req.user)) {
      return res.status(403).json({
        message: "Only parent accounts can view child details"
      });
    }

    const child = await User.findOne({
      _id: req.params.childId,
      linkedParent: req.user._id,
      role: { $in: ["student", "child"] },
      isParent: { $ne: true }
    }).select("-password");

    if (!child) {
      return res.status(404).json({
        message: "Linked child not found"
      });
    }

    res.json(await buildChildDetailPayload(child));
  } catch (error) {
    res.status(500).json({
      message: "Server error"
    });
  }
};

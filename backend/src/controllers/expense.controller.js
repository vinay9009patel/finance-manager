import Expense from "../models/Expense.model.js";
import { createLinkedNotification } from "../services/notification.service.js";
import { getCategoryBudgetSummary } from "../services/budget.service.js";
import { expenseValidator } from "../utils/validator.js";

export const addExpense = async (req, res) => {

  const { error } = expenseValidator.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: error.details[0].message
    });
  }

  try {

    const { title, amount, category, notes } = req.body;

    const expense = await Expense.create({
      user: req.user._id,
      title,
      amount,
      category,
      notes
    });

    const expenseMonth = new Date(expense.createdAt).toISOString().slice(0, 7);
    const budgetSummary = await getCategoryBudgetSummary({
      userId: req.user._id,
      month: expenseMonth,
      category
    });

    await createLinkedNotification({
      actorUserId: req.user._id,
      type: "expense",
      actorMessage: `Expense added: Rs.${amount} in ${category}`,
      parentMessage: `${req.user.name || "Student"} added an expense of Rs.${amount} in ${category}`
    });

    if (budgetSummary?.budgetAmount > 0) {
      const previousSpent = Math.max(0, budgetSummary.spent - (Number(expense.amount) || 0));
      const previousPercent = (previousSpent / budgetSummary.budgetAmount) * 100;
      const crossedWarning = previousPercent < 80 && budgetSummary.percentUsed >= 80;
      const crossedLimit = previousSpent <= budgetSummary.budgetAmount && budgetSummary.spent > budgetSummary.budgetAmount;

      if (crossedWarning || crossedLimit) {
        const actorMessage = budgetSummary.exceeded
          ? `Warning: Your ${category} budget has been exceeded.`
          : `Warning: You have used ${Math.round(budgetSummary.percentUsed)}% of your ${category} budget.`;

        await createLinkedNotification({
          actorUserId: req.user._id,
          type: "warning",
          actorMessage,
          parentMessage: `${req.user.name || "Student"} is close to the ${category} budget limit`
        });
      }
    }

    res.status(201).json({
      message: "Expense added",
      expense,
      budgetStatus: budgetSummary
    });

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    });

  }

};

export const getExpenses = async (req, res) => {

  try {

    // pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    // filter object
    const filter = {
      user: req.user._id
    };

    // category filtering
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // month filtering
    if (req.query.month) {

      const start = new Date(`${req.query.month}-01`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);

      filter.createdAt = {
        $gte: start,
        $lt: end
      };

    }

    // database query
    const expenses = await Expense.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // total documents
    const total = await Expense.countDocuments(filter);

    res.status(200).json({
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      data: expenses
    });

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    });

  }

};

export const deleteExpense = async (req, res) => {

  try {

    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found"
      });
    }

    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        message: "Not authorized"
      });
    }

    await expense.deleteOne();

    await createLinkedNotification({
      actorUserId: req.user._id,
      type: "expense",
      actorMessage: `Expense deleted: Rs.${expense.amount} from ${expense.category}`,
      parentMessage: `${req.user.name || "Student"} deleted an expense of Rs.${expense.amount} from ${expense.category}`
    });

    res.json({
      message: "Expense deleted"
    });

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    });

  }

};

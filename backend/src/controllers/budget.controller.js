import Budget from "../models/Budget.model.js";
import { createLinkedNotification, createNotification } from "../services/notification.service.js";
import {
  getBudgetSummariesForMonth,
  getCategoryBudgetSummary,
  normalizeBudgetCategory,
  OVERALL_BUDGET_CATEGORY
} from "../services/budget.service.js";
import { budgetValidator } from "../utils/validator.js";

const mapBudgetResponse = (budget) => ({
  ...budget.toObject(),
  category: normalizeBudgetCategory(budget.category),
  budgetAmount: Number(budget.budgetAmount ?? budget.amount ?? 0),
  amount: Number(budget.budgetAmount ?? budget.amount ?? 0)
});

const buildWarningMessage = (summary) => (
  summary.exceeded
    ? `Warning: You have exceeded your ${summary.category} budget.`
    : `Warning: You have used ${Math.round(summary.percentUsed)}% of your ${summary.category} budget.`
);

export const setBudget = async (req, res) => {
  try {
    const { error } = budgetValidator.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message
      });
    }

    const month = req.body.month;
    const category = normalizeBudgetCategory(req.body.category);
    const amount = Number(req.body.budgetAmount ?? req.body.amount ?? 0);

    const budget = await Budget.findOneAndUpdate(
      {
        user: req.user._id,
        month,
        category
      },
      {
        $set: {
          month,
          category,
          budgetAmount: amount,
          amount
        }
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    );

    await createNotification(
      req.user._id,
      "budget",
      category === OVERALL_BUDGET_CATEGORY
        ? `Budget set for ${month}: Rs.${amount}`
        : `${category} budget set for ${month}: Rs.${amount}`
    );

    return res.status(201).json({
      message: "Budget set",
      budget: mapBudgetResponse(budget)
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error"
    });
  }
};

export const getBudget = async (req, res) => {
  try {
    const filter = {
      user: req.user._id
    };

    if (req.query.month) {
      filter.month = req.query.month;
    }

    if (req.query.category) {
      filter.category = normalizeBudgetCategory(req.query.category);
    }

    const budgets = await Budget.find(filter).sort({ month: -1, category: 1, updatedAt: -1 });

    return res.json(budgets.map(mapBudgetResponse));
  } catch (error) {
    return res.status(500).json({
      message: "Server error"
    });
  }
};

export const getBudgetStatus = async (req, res) => {
  try {
    const month = req.query.month;

    if (!month) {
      return res.status(400).json({
        message: "Month is required"
      });
    }

    if (req.query.category) {
      const summary = await getCategoryBudgetSummary({
        userId: req.user._id,
        month,
        category: req.query.category
      });

      if (!summary) {
        return res.status(404).json({
          message: "Budget not set"
        });
      }

      return res.json(summary);
    }

    const budgets = await getBudgetSummariesForMonth({
      userId: req.user._id,
      month
    });

    return res.json({
      month,
      overallBudget: budgets.find((item) => item.category === OVERALL_BUDGET_CATEGORY) || null,
      categoryBudgets: budgets.filter((item) => item.category !== OVERALL_BUDGET_CATEGORY)
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error"
    });
  }
};

export const getBudgetWarning = async (req, res) => {
  try {
    const month = req.query.month;

    if (!month) {
      return res.status(400).json({
        message: "Month is required"
      });
    }

    const summaries = req.query.category
      ? [await getCategoryBudgetSummary({
        userId: req.user._id,
        month,
        category: req.query.category
      })].filter(Boolean)
      : await getBudgetSummariesForMonth({
        userId: req.user._id,
        month
      });

    if (!summaries.length) {
      return res.status(404).json({
        message: "Budget not set"
      });
    }

    const warnings = summaries
      .filter((item) => item.warning)
      .map((item) => ({
        ...item,
        message: buildWarningMessage(item)
      }));

    const primaryWarning = warnings[0] || null;

    if (primaryWarning) {
      await createLinkedNotification({
        actorUserId: req.user._id,
        type: "warning",
        actorMessage: primaryWarning.message,
        parentMessage: `${req.user.name || "Student"} is close to the ${primaryWarning.category} budget limit`
      });
    }

    return res.json({
      month,
      warning: Boolean(primaryWarning),
      message: primaryWarning?.message || "Budget is under control",
      warnings
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error"
    });
  }
};

export const updateBudget = async (req, res) => {
  try {
    const { error } = budgetValidator.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message
      });
    }

    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        message: "Budget not found"
      });
    }

    if (budget.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        message: "Not authorized"
      });
    }

    budget.month = req.body.month;
    budget.category = normalizeBudgetCategory(req.body.category || budget.category);
    budget.budgetAmount = Number(req.body.budgetAmount ?? req.body.amount ?? budget.budgetAmount ?? budget.amount);
    budget.amount = budget.budgetAmount;

    await budget.save();

    return res.json({
      message: "Budget updated",
      budget: mapBudgetResponse(budget)
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error"
    });
  }
};

export const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        message: "Budget not found"
      });
    }

    if (budget.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        message: "Not authorized"
      });
    }

    await budget.deleteOne();

    return res.json({
      message: "Budget deleted"
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error"
    });
  }
};

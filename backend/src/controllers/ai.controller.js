import Income from "../models/Income.model.js";
import Expense from "../models/Expense.model.js";
import { getAIAdvice } from "../services/ai.service.js";

export const getFinanceAdvice = async (req, res) => {

  try {

    const incomes = await Income.find({ user: req.user._id });
    const expenses = await Expense.find({ user: req.user._id });

    const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
    const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);

    const balance = totalIncome - totalExpense;

    const analytics = {};

    expenses.forEach(exp => {

      if (!analytics[exp.category]) {
        analytics[exp.category] = 0;
      }

      analytics[exp.category] += exp.amount;

    });

    const prompt = `
User Financial Data:

Total Income: ${totalIncome}
Total Expense: ${totalExpense}
Balance: ${balance}

Category Spending:
${JSON.stringify(analytics)}

Give short advice to save money.
`;

    const advice = await getAIAdvice(prompt);

    res.json({
      summary: {
        totalIncome,
        totalExpense,
        balance
      },
      analytics,
      advice
    });

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    });

  }

};
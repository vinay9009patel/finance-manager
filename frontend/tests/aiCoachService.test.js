import test from "node:test";
import assert from "node:assert/strict";

import {
  buildCoachInsights,
  generateMotivationMessage,
  generateWeeklySummary
} from "../src/services/aiCoachService.js";

test("generateWeeklySummary highlights top category pressure", () => {
  const result = generateWeeklySummary({
    userName: "Vinay",
    expenses: [
      { amount: 3000, category: "food", createdAt: "2026-03-10T10:00:00.000Z" },
      { amount: 1000, category: "travel", createdAt: "2026-03-11T10:00:00.000Z" }
    ],
    incomes: [
      { amount: 10000, createdAt: "2026-03-10T08:00:00.000Z" }
    ],
    budget: 20000
  });

  assert.match(result, /food/i);
});

test("generateMotivationMessage points to next badge", () => {
  const result = generateMotivationMessage({
    userName: "Vinay",
    streak: 5
  });

  assert.match(result, /Silver Saver/i);
  assert.match(result, /2 more days|2 more day/i);
});

test("buildCoachInsights returns all expected coach messages", () => {
  const insights = buildCoachInsights({
    userName: "Vinay",
    expenses: [{ amount: 500, category: "food", createdAt: "2026-03-14T09:00:00.000Z" }],
    incomes: [{ amount: 2000, createdAt: "2026-03-14T08:00:00.000Z" }],
    streak: 3,
    budget: 10000,
    dashboardData: {
      totalIncome: 2000,
      totalExpense: 500
    }
  });

  assert.ok(insights.tipOfDay);
  assert.ok(insights.weeklyInsight);
  assert.ok(insights.motivation);
  assert.ok(insights.warning);
});

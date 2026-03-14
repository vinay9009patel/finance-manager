import test from "node:test";
import assert from "node:assert/strict";

import {
  getAchievementBadges,
  getLongestSavingStreak,
  getProgressToNextBadge
} from "../src/utils/gamification.js";

test("getProgressToNextBadge returns correct intermediate milestone progress", () => {
  const progress = getProgressToNextBadge(5);

  assert.equal(progress.nextBadge.badgeName, "Silver Saver");
  assert.equal(progress.currentValue, 2);
  assert.equal(progress.targetValue, 4);
});

test("getAchievementBadges maps unlocked badges correctly", () => {
  const badges = getAchievementBadges([
    {
      badgeName: "Bronze Saver",
      description: "Saved money for 3 days",
      createdAt: "2026-03-10T00:00:00.000Z"
    }
  ]);

  assert.equal(badges.find((item) => item.badgeName === "Bronze Saver")?.unlocked, true);
  assert.equal(badges.find((item) => item.badgeName === "Silver Saver")?.unlocked, false);
});

test("getLongestSavingStreak calculates consecutive saving days", () => {
  const incomes = [
    { amount: 1000, createdAt: "2026-03-10T08:00:00.000Z" },
    { amount: 900, createdAt: "2026-03-11T08:00:00.000Z" },
    { amount: 800, createdAt: "2026-03-12T08:00:00.000Z" }
  ];
  const expenses = [
    { amount: 400, createdAt: "2026-03-10T10:00:00.000Z" },
    { amount: 300, createdAt: "2026-03-11T10:00:00.000Z" },
    { amount: 200, createdAt: "2026-03-12T10:00:00.000Z" }
  ];

  assert.equal(getLongestSavingStreak(incomes, expenses), 3);
});

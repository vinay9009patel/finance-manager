import test from "node:test";
import assert from "node:assert/strict";

import {
  budgetValidator,
  expenseValidator,
  incomeValidator,
  loginValidator,
  registerValidator
} from "../src/utils/validator.js";

test("registerValidator accepts a valid payload", () => {
  const { error } = registerValidator.validate({
    name: "Vinay Kumar",
    email: "vinay@example.com",
    password: "secret123"
  });

  assert.equal(error, undefined);
});

test("loginValidator rejects invalid email", () => {
  const { error } = loginValidator.validate({
    email: "bad-email",
    password: "secret123"
  });

  assert.ok(error);
});

test("expenseValidator rejects negative amounts", () => {
  const { error } = expenseValidator.validate({
    title: "Lunch",
    amount: -20,
    category: "food",
    notes: ""
  });

  assert.ok(error);
});

test("incomeValidator accepts valid income payload", () => {
  const { error } = incomeValidator.validate({
    source: "Salary",
    amount: 5000,
    notes: "Monthly salary"
  });

  assert.equal(error, undefined);
});

test("budgetValidator requires month and amount", () => {
  const { error } = budgetValidator.validate({
    amount: 10000,
    month: "2026-03"
  });

  assert.equal(error, undefined);
});

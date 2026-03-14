import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getExpenses } from "../services/expenseService";
import {
  createBudget,
  deleteBudget,
  getBudgetStatus,
  saveBudget,
  updateBudget
} from "../services/budgetService";
import { getCurrentUser, getMonthKey } from "../utils/helper";
import { addNotification } from "../utils/notificationStore";
import { generateWarningMessage } from "../services/aiCoachService";
import { CATEGORY_META, EXPENSE_CATEGORIES, formatCategoryLabel } from "../utils/categories";

const Budget = () => {
  const monthKey = getMonthKey();
  const [expenses, setExpenses] = useState([]);
  const [overallBudget, setOverallBudget] = useState("");
  const [categoryBudgets, setCategoryBudgets] = useState([]);
  const [form, setForm] = useState({
    category: "food",
    budgetAmount: ""
  });
  const [editingBudgetId, setEditingBudgetId] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingOverall, setSavingOverall] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBudgetPage = async () => {
      setLoading(true);
      try {
        const [expenseData, budgetStatus] = await Promise.all([
          getExpenses({ month: monthKey }),
          getBudgetStatus(monthKey)
        ]);

        setExpenses(expenseData);
        setOverallBudget(String(Number(budgetStatus?.overallBudget?.budgetAmount) || ""));
        setCategoryBudgets(budgetStatus?.categoryBudgets || []);
      } finally {
        setLoading(false);
      }
    };

    loadBudgetPage();
  }, [monthKey]);

  const monthlySpent = useMemo(() => (
    expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
  ), [expenses]);

  const overallBudgetValue = Number(overallBudget) || 0;
  const overallRemaining = overallBudgetValue - monthlySpent;
  const overallExceeded = overallBudgetValue > 0 && monthlySpent > overallBudgetValue;

  useEffect(() => {
    const highPressureBudget = categoryBudgets.find((item) => item.warning);

    if (overallExceeded || highPressureBudget) {
      const warning = generateWarningMessage({
        userName: getCurrentUser()?.name,
        expenses,
        incomes: [],
        budget: overallBudgetValue,
        categoryBudgets,
        currentSummary: {
          totalExpense: monthlySpent
        }
      });

      addNotification({
        title: "AI Finance Coach",
        message: warning,
        type: "ai"
      });
    }
  }, [categoryBudgets, expenses, monthlySpent, overallBudgetValue, overallExceeded]);

  const refreshBudgetState = async () => {
    const [expenseData, budgetStatus] = await Promise.all([
      getExpenses({ month: monthKey }),
      getBudgetStatus(monthKey)
    ]);

    setExpenses(expenseData);
    setOverallBudget(String(Number(budgetStatus?.overallBudget?.budgetAmount) || ""));
    setCategoryBudgets(budgetStatus?.categoryBudgets || []);
  };

  const handleOverallSave = async () => {
    setSavingOverall(true);
    try {
      await saveBudget({
        amount: overallBudgetValue,
        month: monthKey
      });
      await refreshBudgetState();
      toast.success("Monthly budget saved");
      addNotification({
        title: "Budget updated",
        message: `Monthly budget set to Rs.${overallBudgetValue}`,
        type: "budget"
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save monthly budget");
    } finally {
      setSavingOverall(false);
    }
  };

  const resetForm = () => {
    setForm({
      category: "food",
      budgetAmount: ""
    });
    setEditingBudgetId("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingBudgetId) {
        await updateBudget(editingBudgetId, {
          category: form.category,
          budgetAmount: form.budgetAmount,
          month: monthKey
        });
        toast.success("Category budget updated");
      } else {
        await createBudget({
          category: form.category,
          budgetAmount: form.budgetAmount,
          month: monthKey
        });
        toast.success("Category budget created");
      }

      await refreshBudgetState();
      addNotification({
        title: "Budget updated",
        message: `${formatCategoryLabel(form.category)} budget saved for ${monthKey}`,
        type: "budget"
      });
      resetForm();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save category budget");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingBudgetId(item._id);
    setForm({
      category: item.category,
      budgetAmount: String(item.budgetAmount)
    });
  };

  const handleDelete = async (id) => {
    try {
      await deleteBudget(id);
      await refreshBudgetState();
      toast.success("Budget deleted");
      if (editingBudgetId === id) {
        resetForm();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete budget");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">
          Budget Management
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          Set monthly category budgets and track actual spending against each limit.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-white/8 bg-gray-800/75 p-6 shadow-[0_20px_45px_rgba(0,0,0,0.26)] backdrop-blur-xl">
          <p className="text-[11px] uppercase tracking-[0.24em] text-green-300/80">
            Monthly Cap
          </p>
          <h2 className="mt-2 text-lg font-semibold text-white">
            Overall monthly budget
          </h2>

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
            <input
              type="number"
              value={overallBudget}
              onChange={(e) => setOverallBudget(e.target.value)}
              className="w-full rounded-2xl border border-white/8 bg-gray-800/90 p-3 text-white outline-none transition focus:border-green-400/35 focus:ring-2 focus:ring-green-500/10 sm:w-64"
              placeholder="Monthly budget"
            />

            <button
              type="button"
              onClick={handleOverallSave}
              disabled={savingOverall}
              className="rounded-2xl bg-green-500 px-4 py-3 font-medium text-white transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {savingOverall ? "Saving..." : "Save Monthly Budget"}
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <p className="text-sm text-gray-400">Budget</p>
              <p className="mt-1 text-2xl font-bold text-white">Rs.{overallBudgetValue}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <p className="text-sm text-gray-400">Spent</p>
              <p className="mt-1 text-2xl font-bold text-orange-400">Rs.{monthlySpent}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <p className="text-sm text-gray-400">Remaining</p>
              <p className={`mt-1 text-2xl font-bold ${overallExceeded ? "text-red-400" : "text-green-400"}`}>
                Rs.{overallRemaining}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/8 bg-gray-800/75 p-6 shadow-[0_20px_45px_rgba(0,0,0,0.26)] backdrop-blur-xl">
          <p className="text-[11px] uppercase tracking-[0.24em] text-orange-300/80">
            Category Budget
          </p>
          <h2 className="mt-2 text-lg font-semibold text-white">
            {editingBudgetId ? "Edit category limit" : "Add category limit"}
          </h2>

          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
            <select
              value={form.category}
              onChange={(e) => setForm((current) => ({ ...current, category: e.target.value }))}
              className="rounded-2xl border border-white/8 bg-gray-800/90 p-3 text-white outline-none transition focus:border-green-400/35 focus:ring-2 focus:ring-green-500/10"
            >
              {EXPENSE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {formatCategoryLabel(category)}
                </option>
              ))}
            </select>

            <input
              type="number"
              value={form.budgetAmount}
              onChange={(e) => setForm((current) => ({ ...current, budgetAmount: e.target.value }))}
              className="rounded-2xl border border-white/8 bg-gray-800/90 p-3 text-white outline-none transition focus:border-green-400/35 focus:ring-2 focus:ring-green-500/10"
              placeholder="Budget amount"
              required
            />

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={saving}
                className="rounded-2xl bg-green-500 px-4 py-3 font-medium text-white transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? "Saving..." : editingBudgetId ? "Update Budget" : "Create Budget"}
              </button>

              {editingBudgetId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-white transition hover:bg-white/[0.06]"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/8 bg-gray-800/75 p-6 shadow-[0_20px_45px_rgba(0,0,0,0.26)] backdrop-blur-xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-green-300/80">
              Category Budgets
            </p>
            <h2 className="mt-2 text-lg font-semibold text-white">
              Spend vs budget for {monthKey}
            </h2>
          </div>
          <span className="text-sm text-gray-400">
            {categoryBudgets.length} categories tracked
          </span>
        </div>

        <div className="mt-6 space-y-4">
          {!loading && categoryBudgets.length === 0 && (
            <div className="rounded-3xl border border-dashed border-white/8 bg-white/[0.03] px-6 py-12 text-center">
              <p className="text-base font-medium text-white">
                No category budgets yet
              </p>
              <p className="mt-2 text-sm text-gray-400">
                Add your first category budget to start receiving alerts and AI suggestions.
              </p>
            </div>
          )}

          {categoryBudgets.map((item) => {
            const meta = CATEGORY_META[item.category] || CATEGORY_META.other;
            const progress = Math.max(0, Math.min(100, Number(item.percentUsed) || 0));

            return (
              <div key={item._id} className="rounded-3xl border border-white/8 bg-white/[0.03] p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${item.exceeded ? "border-red-500/20 bg-red-500/10 text-red-200" : item.warning ? "border-orange-500/20 bg-orange-500/10 text-orange-200" : "border-green-500/20 bg-green-500/10 text-green-200"}`}>
                      {meta.icon}
                    </div>

                    <div>
                      <p className="font-semibold text-white">
                        {formatCategoryLabel(item.category)}
                      </p>
                      <p className="text-sm text-gray-400">
                        Rs.{item.spent} / Rs.{item.budgetAmount}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleEdit(item)}
                      className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-white transition hover:bg-white/[0.06]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item._id)}
                      className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200 transition hover:bg-red-500/15"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/8">
                  <div
                    className={`h-full rounded-full transition-all ${item.exceeded ? "bg-red-400" : item.warning ? "bg-orange-400" : "bg-green-400"}`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>

                <div className="mt-3 flex flex-col gap-2 text-sm text-gray-400 sm:flex-row sm:items-center sm:justify-between">
                  <p>
                    {item.exceeded
                      ? `Exceeded by Rs.${Math.abs(item.remaining)}`
                      : `Remaining Rs.${Math.max(0, item.remaining)}`}
                  </p>
                  <p className={item.exceeded ? "text-red-300" : item.warning ? "text-orange-300" : "text-green-300"}>
                    {item.exceeded
                      ? "Limit crossed"
                      : item.warning
                        ? `${Math.round(progress)}% used`
                        : "Under control"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Budget;

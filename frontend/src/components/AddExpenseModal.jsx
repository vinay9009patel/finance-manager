import { useState } from "react";
import { addExpense } from "../services/expenseService";
import toast from "react-hot-toast";
import { addNotification } from "../utils/notificationStore";
import { getCurrentUser } from "../utils/helper";
import { generateDailyInsight } from "../services/aiCoachService";
import { EXPENSE_CATEGORIES, formatCategoryLabel } from "../utils/categories";

const AddExpenseModal = ({ open, onClose, onExpenseAdded }) => {
  const [form, setForm] = useState({
    amount: "",
    category: "food",
    notes: ""
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await addExpense(form);
      const user = getCurrentUser();
      const budgetStatus = response?.budgetStatus;
      const message = generateDailyInsight({
        userName: user?.name,
        expenses: [{
          amount: form.amount,
          category: form.category,
          createdAt: new Date().toISOString()
        }],
        incomes: [],
        streak: 0,
        budget: 0,
        categoryBudgets: budgetStatus ? [budgetStatus] : []
      });

      setForm({
        amount: "",
        category: "food",
        notes: ""
      });

      await onExpenseAdded();

      toast.success("Expense added");
      addNotification({
        title: "AI Finance Coach",
        message,
        type: "ai"
      });

      if (budgetStatus?.warning) {
        const budgetMessage = budgetStatus.exceeded
          ? `${formatCategoryLabel(form.category)} budget exceeded.`
          : `Warning: ${Math.round(budgetStatus.percentUsed)}% of ${formatCategoryLabel(form.category)} budget used.`;

        toast.error(budgetMessage);
        addNotification({
          title: "Budget alert",
          message: budgetMessage,
          type: "budget"
        });
      }
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to add expense");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-md">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.96),rgba(15,23,42,0.9))] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.45)]">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,197,94,0.14),transparent_45%,rgba(249,115,22,0.12))]" />

        <div className="relative">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-green-300/80">
                Quick Action
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">
                Add Expense
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                Capture a new transaction with category and notes.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/8 bg-white/5 px-3 py-2 text-xs text-gray-300 transition hover:text-white"
            >
              Close
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="number"
              name="amount"
              placeholder="Amount"
              value={form.amount}
              onChange={handleChange}
              required
              className="rounded-2xl border border-white/8 bg-gray-800/90 p-3 text-white outline-none transition focus:border-green-400/35 focus:ring-2 focus:ring-green-500/10"
            />

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="rounded-2xl border border-white/8 bg-gray-800/90 p-3 text-white outline-none transition focus:border-green-400/35 focus:ring-2 focus:ring-green-500/10"
            >
              {EXPENSE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {formatCategoryLabel(category)}
                </option>
              ))}
            </select>

            <input
              type="text"
              name="notes"
              placeholder="Notes"
              value={form.notes}
              onChange={handleChange}
              className="rounded-2xl border border-white/8 bg-gray-800/90 p-3 text-white outline-none transition focus:border-green-400/35 focus:ring-2 focus:ring-green-500/10"
            />

            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-green-500 px-4 py-3 font-medium text-white shadow-[0_12px_25px_rgba(34,197,94,0.28)] transition hover:-translate-y-0.5 hover:bg-green-400 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? "Saving..." : "Save Expense"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddExpenseModal;

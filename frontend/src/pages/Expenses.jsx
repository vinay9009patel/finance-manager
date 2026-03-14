import { useCallback, useEffect, useMemo, useState } from "react";
import Chart from "../components/Chart";
import ExpenseTable from "../components/ExpenseTable";
import AddExpenseModal from "../components/AddExpenseModal";
import { getDashboardData } from "../services/dashboardService";
import { deleteExpense, getExpenses } from "../services/expenseService";
import toast from "react-hot-toast";

const metricCards = (dashboardData) => [
  {
    title: "Total Income",
    value: `Rs.${Number(dashboardData.totalIncome || 0).toLocaleString()}`,
    tone: "text-green-400",
    badge: "Income"
  },
  {
    title: "Total Expenses",
    value: `Rs.${Number(dashboardData.totalExpense || 0).toLocaleString()}`,
    tone: "text-orange-400",
    badge: "Expense"
  },
  {
    title: "Balance",
    value: `Rs.${Number(dashboardData.balance || 0).toLocaleString()}`,
    tone: "text-white",
    badge: "Balance"
  },
  {
    title: "Saving Streak",
    value: `${dashboardData.streak || 0} Days`,
    tone: "text-green-300",
    badge: "Streak"
  }
];

const Expenses = () => {
  const [openModal, setOpenModal] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");
  const [dashboardData, setDashboardData] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    streak: 0
  });

  const loadExpenses = async () => {
    const data = await getExpenses();
    setExpenses(data);
  };

  const loadDashboard = async () => {
    const data = await getDashboardData();
    setDashboardData({
      totalIncome: data?.totalIncome || 0,
      totalExpense: data?.totalExpense || 0,
      balance: data?.balance || 0,
      streak: data?.streak || 0
    });
  };

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadExpenses(), loadDashboard()]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteExpense(id);
      toast.success("Expense deleted");
      await refreshAll();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete expense");
    }
  };

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      const categoryMatch = categoryFilter ? item.category === categoryFilter : true;
      const searchMatch = search
        ? `${item.category} ${item.notes || ""}`.toLowerCase().includes(search.toLowerCase())
        : true;

      return categoryMatch && searchMatch;
    });
  }, [expenses, categoryFilter, search]);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">
          Expenses
        </h1>

        <button
          onClick={() => setOpenModal(true)}
          className="bg-green-500 px-4 py-2 rounded-lg hover:bg-green-600"
        >
          + Add Expense
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {metricCards(dashboardData).map((card) => (
          <div
            key={card.title}
            className="overflow-hidden rounded-2xl border border-white/6 bg-[linear-gradient(180deg,rgba(17,24,39,0.96),rgba(15,23,42,0.9))] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.24)] sm:p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">
                  Overview
                </p>
                <h2 className="mt-2 text-sm font-medium text-gray-200">
                  {card.title}
                </h2>
              </div>
              <span className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-gray-300">
                {card.badge}
              </span>
            </div>

            <div className={`mt-5 text-[1.7rem] font-bold tracking-tight sm:text-3xl ${card.tone}`}>
              {loading ? (
                <div className="h-9 w-28 animate-pulse rounded-lg bg-white/8" />
              ) : (
                card.value
              )}
            </div>

            <div className="mt-4 flex items-center justify-between gap-2 text-xs">
              <span className="rounded-full border border-green-500/15 bg-green-500/10 px-2.5 py-1 text-green-300">
                Live metrics
              </span>
              <span className="text-gray-500">
                Updated just now
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-xl bg-gray-800 p-4 shadow md:flex-row md:items-center">
        <input
          type="text"
          placeholder="Search by category or notes"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-0 flex-1 rounded bg-gray-700 p-2"
        />

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded bg-gray-700 p-2 md:w-56"
        >
          <option value="">All Categories</option>
          <option value="food">food</option>
          <option value="travel">travel</option>
          <option value="shopping">shopping</option>
          <option value="bills">bills</option>
          <option value="entertainment">entertainment</option>
          <option value="education">education</option>
          <option value="health">health</option>
          <option value="other">other</option>
        </select>
      </div>

      <Chart expenses={filteredExpenses} />

      <ExpenseTable
        expenses={filteredExpenses}
        onDelete={handleDelete}
      />

      <AddExpenseModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onExpenseAdded={refreshAll}
      />
    </div>
  );
};

export default Expenses;

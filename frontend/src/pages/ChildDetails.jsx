import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { getChildDashboardData } from "../services/dashboardService";
import { getCurrentUser, isParentAccount } from "../utils/helper";

const COLORS = ["#22c55e", "#f97316", "#14b8a6", "#eab308", "#3b82f6", "#ef4444"];

const ChildDetails = () => {
  const { childId } = useParams();
  const user = getCurrentUser();
  const [loading, setLoading] = useState(true);
  const [monthFilter, setMonthFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [data, setData] = useState({
    child: null,
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    incomes: [],
    expenses: []
  });

  useEffect(() => {
    const loadChildDetails = async () => {
      setLoading(true);
      try {
        const response = await getChildDashboardData(childId);
        setData({
          child: response.child,
          totalIncome: response.totalIncome || 0,
          totalExpense: response.totalExpense || 0,
          balance: response.balance || 0,
          incomes: response.incomes || [],
          expenses: response.expenses || []
        });
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load child details");
      } finally {
        setLoading(false);
      }
    };

    if (childId) {
      loadChildDetails();
    }
  }, [childId]);

  const months = useMemo(() => {
    return Array.from(new Set(
      [...data.expenses, ...data.incomes].map((item) => {
        const createdAt = new Date(item.createdAt || item.date || Date.now());
        return `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}`;
      })
    )).sort().reverse();
  }, [data.expenses, data.incomes]);

  const categories = useMemo(() => {
    return Array.from(new Set(data.expenses.map((item) => item.category || "other"))).sort();
  }, [data.expenses]);

  const filteredExpenses = useMemo(() => {
    return data.expenses.filter((item) => {
      const createdAt = new Date(item.createdAt || item.date || Date.now());
      const monthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}`;
      const monthMatch = monthFilter === "all" || monthKey === monthFilter;
      const categoryMatch = categoryFilter === "all" || (item.category || "other") === categoryFilter;
      return monthMatch && categoryMatch;
    });
  }, [categoryFilter, data.expenses, monthFilter]);

  const filteredIncomes = useMemo(() => {
    return data.incomes.filter((item) => {
      const createdAt = new Date(item.createdAt || item.date || Date.now());
      const monthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}`;
      return monthFilter === "all" || monthKey === monthFilter;
    });
  }, [data.incomes, monthFilter]);

  const activity = useMemo(() => {
    const incomeItems = filteredIncomes.map((item) => ({
      id: item._id,
      type: "income",
      title: item.source || "Income",
      amount: `+ Rs.${item.amount}`,
      createdAt: new Date(item.createdAt || item.date || Date.now())
    }));

    const expenseItems = filteredExpenses.map((item) => ({
      id: item._id,
      type: "expense",
      title: item.category || "Expense",
      amount: `- Rs.${item.amount}`,
      createdAt: new Date(item.createdAt || item.date || Date.now())
    }));

    return [...incomeItems, ...expenseItems]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10);
  }, [filteredExpenses, filteredIncomes]);

  const categorySpending = useMemo(() => {
    const map = filteredExpenses.reduce((acc, item) => {
      const category = item.category || "other";
      acc[category] = (acc[category] || 0) + (Number(item.amount) || 0);
      return acc;
    }, {});

    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredExpenses]);

  const monthlyComparison = useMemo(() => {
    const monthlyExpense = filteredExpenses.reduce((acc, item) => {
      const createdAt = new Date(item.createdAt || item.date || Date.now());
      const key = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}`;
      acc[key] = (acc[key] || 0) + (Number(item.amount) || 0);
      return acc;
    }, {});

    const monthlyIncome = filteredIncomes.reduce((acc, item) => {
      const createdAt = new Date(item.createdAt || item.date || Date.now());
      const key = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}`;
      acc[key] = (acc[key] || 0) + (Number(item.amount) || 0);
      return acc;
    }, {});

    return Array.from(new Set([...Object.keys(monthlyExpense), ...Object.keys(monthlyIncome)]))
      .sort()
      .map((month) => ({
        month,
        income: monthlyIncome[month] || 0,
        expense: monthlyExpense[month] || 0
      }));
  }, [filteredExpenses, filteredIncomes]);

  if (!isParentAccount(user)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {loading ? "Child Details" : data.child?.name || "Child Details"}
          </h1>
          {!loading && data.child?.email && (
            <p className="mt-1 text-sm text-gray-400">
              {data.child.email}
            </p>
          )}
        </div>

        <Link
          to="/"
          className="rounded-xl bg-gray-700 px-4 py-2 transition hover:bg-gray-600"
        >
          Back
        </Link>
      </div>

      {loading && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-28 rounded-xl bg-gray-800 p-6 shadow animate-pulse"></div>
          ))}
        </div>
      )}

      {!loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-white/5 bg-gray-800 p-6 shadow">
              <p className="text-sm text-gray-400">Total Income</p>
              <p className="mt-1 text-2xl font-bold text-green-400">Rs.{data.totalIncome}</p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-gray-800 p-6 shadow">
              <p className="text-sm text-gray-400">Total Expense</p>
              <p className="mt-1 text-2xl font-bold text-orange-400">Rs.{data.totalExpense}</p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-gray-800 p-6 shadow">
              <p className="text-sm text-gray-400">Balance</p>
              <p className="mt-1 text-2xl font-bold text-white">Rs.{data.balance}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-gray-800 p-6 shadow">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  Child Analytics View
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  Apply filters to inspect the student's money flow without changing account data.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <select
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  className="rounded-xl bg-gray-700 p-3"
                >
                  <option value="all">All Months</option>
                  {months.map((month) => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="rounded-xl bg-gray-700 p-3"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-white/5 bg-gray-800 p-6 shadow">
              <h2 className="mb-4 text-lg font-semibold">
                Recent Activity
              </h2>

              <div className="space-y-3">
                {activity.length === 0 && (
                  <p className="text-sm text-gray-400">
                    No recent activity
                  </p>
                )}

                {activity.map((item) => (
                  <div key={`${item.type}-${item.id}`} className="flex flex-col gap-2 border-b border-gray-700 pb-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm capitalize">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {item.createdAt.toLocaleString()}
                      </p>
                    </div>
                    <p className={item.type === "income" ? "font-semibold text-green-400" : "font-semibold text-orange-400"}>
                      {item.amount}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-gray-800 p-6 shadow">
              <h2 className="mb-4 text-lg font-semibold">
                Child Snapshot
              </h2>

              <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <div className="rounded-xl bg-gray-700 p-4">
                  <p className="text-gray-400">Income entries</p>
                  <p className="mt-1 text-xl font-semibold text-green-400">
                    {filteredIncomes.length}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-700 p-4">
                  <p className="text-gray-400">Expense entries</p>
                  <p className="mt-1 text-xl font-semibold text-orange-400">
                    {filteredExpenses.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-white/5 bg-gray-800 p-6 shadow">
              <h2 className="mb-4 text-lg font-semibold">
                Category Spending
              </h2>
              <div className="h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categorySpending}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={96}
                      labelLine={false}
                    >
                      {categorySpending.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-gray-800 p-6 shadow">
              <h2 className="mb-4 text-lg font-semibold">
                Income vs Expense
              </h2>
              <div className="h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyComparison}>
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip />
                    <Bar dataKey="income" fill="#22c55e" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="expense" fill="#f97316" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-gray-800 p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold">
              All Expenses
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="text-gray-400">
                  <tr>
                    <th className="py-2 text-left">Category</th>
                    <th className="py-2 text-right">Amount</th>
                    <th className="py-2 text-left">Notes</th>
                    <th className="py-2 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.length === 0 && (
                    <tr className="border-t border-gray-700">
                      <td colSpan={4} className="py-3 text-gray-400">No expenses found</td>
                    </tr>
                  )}
                  {filteredExpenses.map((item) => (
                    <tr key={item._id} className="border-t border-gray-700">
                      <td className="py-3 capitalize">{item.category}</td>
                      <td className="py-3 text-right text-orange-400">Rs.{item.amount}</td>
                      <td className="py-3 text-gray-300">{item.notes || "-"}</td>
                      <td className="py-3 text-gray-400">{new Date(item.createdAt || item.date || Date.now()).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-gray-800 p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold">
              All Incomes
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="text-gray-400">
                  <tr>
                    <th className="py-2 text-left">Source</th>
                    <th className="py-2 text-right">Amount</th>
                    <th className="py-2 text-left">Notes</th>
                    <th className="py-2 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIncomes.length === 0 && (
                    <tr className="border-t border-gray-700">
                      <td colSpan={4} className="py-3 text-gray-400">No incomes found</td>
                    </tr>
                  )}
                  {filteredIncomes.map((item) => (
                    <tr key={item._id} className="border-t border-gray-700">
                      <td className="py-3 capitalize">{item.source}</td>
                      <td className="py-3 text-right text-green-400">Rs.{item.amount}</td>
                      <td className="py-3 text-gray-300">{item.notes || "-"}</td>
                      <td className="py-3 text-gray-400">{new Date(item.createdAt || item.date || Date.now()).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChildDetails;

import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { addIncome, getIncomes } from "../services/incomeService";
import toast from "react-hot-toast";
import { addNotification } from "../utils/notificationStore";
import { getCurrentUser } from "../utils/helper";
import { generatePraiseMessage } from "../services/aiCoachService";

const Income = () => {
  const [form, setForm] = useState({
    source: "",
    amount: "",
    notes: ""
  });
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadIncomes = async () => {
    const data = await getIncomes();
    setIncomes(data);
  };

  useEffect(() => {
    loadIncomes();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addIncome({
        source: form.source,
        amount: Number(form.amount),
        notes: form.notes
      });
      const user = getCurrentUser();
      const message = generatePraiseMessage({
        userName: user?.name,
        currentSummary: {
          totalIncome: Number(form.amount) || 0
        }
      });

      setForm({
        source: "",
        amount: "",
        notes: ""
      });
      toast.success("Income added");
      addNotification({
        title: "AI Finance Coach",
        message,
        type: "ai"
      });
      await loadIncomes();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to add income");
    } finally {
      setLoading(false);
    }
  };

  const monthlyOverview = useMemo(() => {
    const bucket = incomes.reduce((acc, item) => {
      const dt = new Date(item.createdAt || item.date || Date.now());
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
      acc[key] = (acc[key] || 0) + (Number(item.amount) || 0);
      return acc;
    }, {});

    return Object.entries(bucket)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, amount]) => ({ month, amount }));
  }, [incomes]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">
        Income
      </h1>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="bg-gray-800 p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-4">
            Add Income
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              name="source"
              value={form.source}
              onChange={handleChange}
              placeholder="Income source"
              className="bg-gray-700 p-3 rounded"
              required
            />

            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="Amount"
              className="bg-gray-700 p-3 rounded"
              required
            />

            <input
              type="text"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Notes"
              className="bg-gray-700 p-3 rounded"
            />

            <button
              type="submit"
              disabled={loading}
              className="bg-green-500 p-3 rounded hover:bg-green-600"
            >
              {loading ? "Saving..." : "Add Income"}
            </button>
          </form>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-4">
            Income List
          </h2>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {incomes.map((item) => (
              <div
                key={item._id}
                className="flex flex-col gap-2 border-b border-gray-700 pb-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm capitalize">
                    {item.source}
                  </p>

                  <p className="text-xs text-gray-400">
                    {item.notes || "-"}
                  </p>
                </div>

                <p className="text-green-400 font-semibold">
                  Rs.{item.amount}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-800 p-4 sm:p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4">
          Monthly Income Overview
        </h2>

        <div className="h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyOverview}>
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Bar dataKey="amount" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Income;

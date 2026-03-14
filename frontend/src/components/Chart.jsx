import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = [
  "#22c55e",
  "#f97316",
  "#3b82f6",
  "#a855f7",
  "#eab308",
  "#14b8a6",
  "#ef4444",
  "#6366f1"
];

const Chart = ({ expenses = [] }) => {
  const categoryTotals = expenses.reduce((acc, expense) => {
    const category = expense.category || "other";
    const amount = Number(expense.amount) || 0;

    if (!acc[category]) {
      acc[category] = 0;
    }

    acc[category] += amount;
    return acc;
  }, {});

  const data = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <div className="rounded-2xl border border-white/6 bg-gray-800/75 p-6 shadow-[0_18px_40px_rgba(0,0,0,0.26)] backdrop-blur-xl">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Expense Breakdown
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            Category distribution across your latest expense data
          </p>
        </div>
        <span className="rounded-full border border-green-500/15 bg-green-500/10 px-3 py-1 text-xs text-green-300">
          {data.length} categories
        </span>
      </div>

      {data.length === 0 ? (
        <div className="flex h-[20rem] items-center justify-center rounded-2xl border border-dashed border-white/8 bg-white/[0.03] text-center">
          <div>
            <p className="text-base font-medium text-white">
              No chart data yet
            </p>
            <p className="mt-2 text-sm text-gray-400">
              Add a few expenses to visualize your spending categories.
            </p>
          </div>
        </div>
      ) : (
        <div className="h-[18rem] sm:h-[20rem]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={92}
                paddingAngle={4}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>

              <Tooltip
                contentStyle={{
                  background: "#0f1720",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                  color: "#fff"
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Chart;

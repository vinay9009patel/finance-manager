const ExpenseTable = ({ expenses, onDelete }) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/6 bg-gray-800/75 shadow-[0_18px_40px_rgba(0,0,0,0.26)] backdrop-blur-xl">
      <div className="flex flex-col gap-3 border-b border-white/6 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Recent Expenses
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            Searchable, filter-ready transaction history
          </p>
        </div>
        <span className="rounded-full border border-orange-500/15 bg-orange-500/10 px-3 py-1 text-xs text-orange-300">
          {expenses.length} entries
        </span>
      </div>

      <div className="max-h-[30rem] overflow-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="sticky top-0 z-10 bg-gray-900/95 text-gray-400 backdrop-blur">
            <tr>
              <th className="px-6 py-4 text-left font-medium">Category</th>
              <th className="px-6 py-4 text-right font-medium">Amount</th>
              <th className="px-6 py-4 text-left font-medium">Notes</th>
              <th className="px-6 py-4 text-right font-medium">Action</th>
            </tr>
          </thead>

          <tbody>
            {expenses.length === 0 && (
              <tr>
                <td className="px-6 py-14 text-center text-gray-400" colSpan={4}>
                  <div className="mx-auto max-w-sm">
                    <p className="text-base font-medium text-white">
                      No expenses found
                    </p>
                    <p className="mt-2 text-sm text-gray-400">
                      Start adding expenses to unlock richer analytics and activity tracking.
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {expenses.map((exp, i) => (
              <tr
                key={exp._id || i}
                className="border-t border-white/6 transition hover:bg-white/[0.04]"
              >
                <td className="px-6 py-4">
                  <span className="inline-flex rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 capitalize text-gray-200">
                    {exp.category}
                  </span>
                </td>

                <td className="px-6 py-4 text-right font-semibold text-orange-400">
                  Rs.{exp.amount}
                </td>

                <td className="px-6 py-4 text-gray-300">
                  {exp.notes || "-"}
                </td>

                <td className="px-6 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => onDelete(exp._id)}
                    className="rounded-xl border border-red-500/15 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 transition hover:border-red-500/25 hover:bg-red-500/15 hover:text-red-200 active:scale-[0.98]"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseTable;

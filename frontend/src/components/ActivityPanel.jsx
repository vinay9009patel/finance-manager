const activityStyles = {
  income: {
    icon: "+",
    ring: "border-green-500/20 bg-green-500/10 text-green-300",
    trail: "from-green-400 to-green-300"
  },
  expense: {
    icon: "-",
    ring: "border-orange-500/20 bg-orange-500/10 text-orange-300",
    trail: "from-orange-400 to-orange-300"
  },
  badge: {
    icon: "T",
    ring: "border-orange-500/20 bg-orange-500/10 text-orange-200",
    trail: "from-orange-300 to-yellow-300"
  },
  streak: {
    icon: "F",
    ring: "border-green-500/20 bg-green-500/10 text-green-200",
    trail: "from-green-400 to-orange-400"
  },
  alert: {
    icon: "!",
    ring: "border-red-500/20 bg-red-500/10 text-red-300",
    trail: "from-red-400 to-orange-300"
  }
};

const formatActivityDate = (item) => {
  if (item.date) return item.date;
  if (item.createdAt) return new Date(item.createdAt).toLocaleString();
  return "Just now";
};

const ActivityPanel = ({ activities = [], loading = false }) => {
  return (
    <div className="rounded-2xl border border-white/6 bg-gray-800/75 p-6 shadow-[0_18px_40px_rgba(0,0,0,0.26)] backdrop-blur-xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Recent Activity
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            Timeline of the latest financial movements
          </p>
        </div>
        <span className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-xs text-gray-300">
          {activities.length} updates
        </span>
      </div>

      <div className="space-y-4">
        {loading && (
          <>
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between rounded-2xl border border-white/6 bg-white/[0.03] p-4 animate-pulse">
                <div className="space-y-2">
                  <div className="h-3 w-32 rounded bg-white/8" />
                  <div className="h-3 w-24 rounded bg-white/6" />
                </div>
                <div className="h-3 w-14 rounded bg-white/8" />
              </div>
            ))}
          </>
        )}

        {!loading && activities.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/8 bg-white/[0.03] px-6 py-12 text-center">
            <p className="text-base font-medium text-white">
              No recent activity
            </p>
            <p className="mt-2 text-sm text-gray-400">
              New income, expenses, and AI suggestions will appear here.
            </p>
          </div>
        )}

        {!loading && activities.map((item, index) => (
          <div
            key={`${item.type}-${item.id || index}`}
            className="group flex items-center justify-between rounded-2xl border border-white/6 bg-white/[0.03] p-4 transition hover:border-green-500/15 hover:bg-white/[0.05]"
          >
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${(activityStyles[item.type] || activityStyles.alert).trail} opacity-30 blur-lg transition duration-300 group-hover:opacity-60`} />
                <div className={`relative flex h-10 w-10 items-center justify-center rounded-2xl border text-sm font-semibold ${(activityStyles[item.type] || activityStyles.alert).ring}`}>
                  {(activityStyles[item.type] || activityStyles.alert).icon}
                </div>
              </div>
              <div>
                <p className="text-sm capitalize text-white">
                  {item.title}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {formatActivityDate(item)}
                </p>
              </div>
            </div>

            <p className={`${item.color || "text-white"} text-sm font-semibold`}>
              {item.amount}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityPanel;

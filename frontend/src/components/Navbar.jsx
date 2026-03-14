import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useNotifications from "../hooks/useNotifications";
import { getCurrentUser, isParentAccount } from "../utils/helper";
import { isAchievementNotification } from "../utils/gamification";

const notificationTone = (item) => {
  if (isAchievementNotification(item)) {
    return {
      badge: "bg-orange-500/15 text-orange-300 border-orange-400/20",
      dot: "from-orange-300 to-yellow-300"
    };
  }

  if (item.type === "budget" || item.type === "warning") {
    return {
      badge: "bg-red-500/15 text-red-300 border-red-400/20",
      dot: "from-red-400 to-orange-300"
    };
  }

  return {
    badge: "bg-green-500/15 text-green-300 border-green-400/20",
    dot: "from-green-300 to-green-500"
  };
};

const Navbar = ({ onMenuClick }) => {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const { items, unreadCount, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const user = getCurrentUser();

  const pageTitle = useMemo(() => {
    const map = {
      "/": "Dashboard",
      "/expenses": "Expenses",
      "/income": "Income",
      "/budget": "Budget",
      "/analytics": "Analytics",
      "/advisor": "AI Advisor",
      "/profile": "Profile"
    };

    if (pathname.startsWith("/children/")) {
      return "Child Details";
    }

    return map[pathname] || "Dashboard";
  }, [pathname]);

  return (
    <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-white/5 text-gray-200 transition hover:border-green-400/25 hover:text-white md:hidden"
        >
          <span className="text-lg leading-none">=</span>
        </button>
        <div>
          <h2 className="text-xl font-semibold text-white">
            {pageTitle}
          </h2>
          <p className="text-sm text-gray-400">
            {isParentAccount(user) ? "Monitor your finances and linked students" : "Track your money with AI-driven insights"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-4">
        <div className="relative">
          <button
            onClick={() => {
              setOpen((prev) => !prev);
              if (!open) {
                markAllRead();
              }
            }}
            className="relative rounded-xl border border-white/8 bg-white/5 px-3 py-2 text-sm text-gray-200 transition hover:border-orange-400/30 hover:text-orange-300"
          >
            Alerts
          </button>

          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 min-w-5 rounded-full bg-orange-500 px-1.5 py-0.5 text-center text-[10px] text-white">
              {unreadCount}
            </span>
          )}

          {open && (
            <div className="absolute right-0 mt-3 z-50 w-[min(24rem,calc(100vw-2rem))] rounded-2xl border border-white/8 bg-[#0f1720] p-4 shadow-2xl">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">
                  Notifications
                </h3>
                <span className="text-xs text-gray-500">
                  Live feed
                </span>
              </div>

              <div className="max-h-64 space-y-2 overflow-y-auto">
                {items.length === 0 && (
                  <p className="text-sm text-gray-400">
                    No notifications
                  </p>
                )}

                {items.map((item) => (
                  <div key={item.id} className="rounded-xl border border-white/6 bg-white/[0.04] p-3">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl border ${notificationTone(item).badge}`}>
                        <div className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r ${notificationTone(item).dot}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white">
                          {item.title}
                        </p>
                        {item.message && (
                          <p className="mt-1 text-xs text-gray-300">
                            {item.message}
                          </p>
                        )}
                        <p className="mt-1 text-[10px] text-gray-400">
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/8 bg-white/5 px-3 py-2">
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt="avatar"
              className="h-9 w-9 rounded-full object-cover ring-1 ring-white/10"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500/15 text-xs font-bold text-green-300">
              {(user?.name || "U").slice(0, 1).toUpperCase()}
            </div>
          )}

          <div className="hidden min-w-0 sm:block">
            <p className="text-sm font-medium text-white">
              {user?.name || "User"}
            </p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400">
              {isParentAccount(user) ? "Adult Parent" : user?.role || "Adult"}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="rounded-xl border border-white/8 bg-white/5 px-3 py-2 text-sm text-gray-200 transition hover:border-orange-400/30 hover:text-orange-300"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;

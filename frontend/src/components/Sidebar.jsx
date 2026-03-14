import { NavLink } from "react-router-dom";
import { getCurrentUser, isParentAccount } from "../utils/helper";

const Sidebar = ({ onNavigate }) => {
  const user = getCurrentUser();

  const navClassName = ({ isActive }) =>
    `rounded-xl px-4 py-3 text-sm font-medium transition ${
      isActive
        ? "border border-green-500/20 bg-green-500/12 text-green-300"
        : "text-gray-300 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <div className="h-full flex flex-col">
      <div className="mb-10">
        <p className="text-[11px] uppercase tracking-[0.28em] text-green-400/80 mb-2">
          AI Personal Finance
        </p>
        <h1 className="text-2xl font-bold text-white">
          Finance Manager
        </h1>
        <p className="mt-3 text-sm text-gray-400">
          {isParentAccount(user) ? "Parent monitoring workspace" : "Personal finance workspace"}
        </p>
      </div>

      <nav className="flex flex-col gap-2">
        <NavLink to="/" className={navClassName} onClick={onNavigate}>
          Dashboard
        </NavLink>

        <NavLink to="/expenses" className={navClassName} onClick={onNavigate}>
          Expenses
        </NavLink>

        <NavLink to="/income" className={navClassName} onClick={onNavigate}>
          Income
        </NavLink>

        <NavLink to="/budget" className={navClassName} onClick={onNavigate}>
          Budget
        </NavLink>

        <NavLink to="/analytics" className={navClassName} onClick={onNavigate}>
          Analytics
        </NavLink>

        <NavLink to="/advisor" className={navClassName} onClick={onNavigate}>
          AI Advisor
        </NavLink>

        <NavLink to="/profile" className={navClassName} onClick={onNavigate}>
          Profile
        </NavLink>

        {isParentAccount(user) && (
          <div className="mt-4 rounded-2xl border border-orange-500/15 bg-orange-500/8 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-orange-300/90">
              Parent Mode
            </p>
            <p className="mt-2 text-sm text-gray-300">
              Connect students from dashboard or profile, then open child view in read-only mode.
            </p>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;

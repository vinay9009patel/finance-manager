export const normalizeRoleLabel = (role) => {
  if (role === "admin" || role === "parent" || role === "adult") return "adult";
  if (role === "user" || role === "student" || role === "child") return "student";
  return "adult";
};

export const getAuthHeaders = () => {
  const token = getToken();

  if (token) {
    return {
      Authorization: `Bearer ${token}`
    };
  }

  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.token) {
      return {
        Authorization: `Bearer ${user.token}`
      };
    }
  } catch {
    return {};
  }

  return {};
};

export const saveAuthSession = (token, user) => {
  if (token) {
    localStorage.setItem("token", token);
  }

  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  }
};

export const clearAuthSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getToken = () => {
  const token = localStorage.getItem("token");
  if (token) return token;

  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.token || "";
  } catch {
    return "";
  }
};

export const getCurrentUser = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user")) || null;
    if (!user) return null;

    return {
      ...user,
      role: normalizeRoleLabel(user.role),
      roleLabel: normalizeRoleLabel(user.roleLabel || user.role),
      isParent: Boolean(user.isParent || user.role === "parent")
    };
  } catch {
    return null;
  }
};

export const isAuthenticated = () => Boolean(getToken());
export const isParentAccount = (user = getCurrentUser()) =>
  Boolean(user?.isParent) && normalizeRoleLabel(user?.role) === "adult";
export const isStudentAccount = (user = getCurrentUser()) =>
  normalizeRoleLabel(user?.role) === "student";

export const getMonthKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

export const getMonthlyBudget = (monthKey = getMonthKey()) => {
  const value = localStorage.getItem(`budget:${monthKey}`);
  return value ? Number(value) : 0;
};

export const setMonthlyBudget = (amount, monthKey = getMonthKey()) => {
  localStorage.setItem(`budget:${monthKey}`, String(Number(amount) || 0));
};

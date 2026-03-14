const PROFILE_META_KEY = "profile_meta";

const normalizeRoleLabel = (role) => {
  if (role === "admin" || role === "parent" || role === "adult") return "adult";
  if (role === "user" || role === "student" || role === "child") return "student";
  return "adult";
};

const readStore = () => {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_META_KEY)) || {};
  } catch {
    return {};
  }
};

const writeStore = (store) => {
  localStorage.setItem(PROFILE_META_KEY, JSON.stringify(store));
};

export const getProfileMeta = (email) => {
  if (!email) return {};
  const store = readStore();
  return store[email] || {};
};

export const saveProfileMeta = (email, meta) => {
  if (!email) return;
  const store = readStore();
  store[email] = {
    ...(store[email] || {}),
    ...meta
  };
  writeStore(store);
};

export const mergeUserWithProfileMeta = (user) => {
  if (!user?.email) return user;
  const meta = getProfileMeta(user.email);
  return {
    ...user,
    ...meta,
    role: normalizeRoleLabel(meta.role || user.role),
    roleLabel: normalizeRoleLabel(meta.roleLabel || user.roleLabel || user.role),
    isParent: Boolean(meta.isParent ?? user.isParent ?? user.role === "parent")
  };
};

export const updateCurrentUserProfile = (meta) => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return;
    const user = JSON.parse(raw);
    const updated = {
      ...user,
      ...meta,
      role: normalizeRoleLabel(meta.role || user.role),
      roleLabel: normalizeRoleLabel(meta.roleLabel || user.roleLabel || user.role),
      isParent: Boolean(meta.isParent ?? user.isParent ?? user.role === "parent")
    };
    localStorage.setItem("user", JSON.stringify(updated));
    if (updated.email) {
      saveProfileMeta(updated.email, meta);
    }
  } catch {
    return;
  }
};

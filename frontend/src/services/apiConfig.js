const trimTrailingSlash = (value = "") => value.replace(/\/+$/, "");

export const API_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_API_BASE_URL || "https://finance-manager-js0c.onrender.com/"
);

export const SOCKET_URL = trimTrailingSlash(
  import.meta.env.VITE_SOCKET_URL || API_BASE_URL
);

export const apiUrl = (path = "") => `${API_BASE_URL}${path}`;

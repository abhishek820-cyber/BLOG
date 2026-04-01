import axios from "axios";

const API_BASE = "https://blog-2hg9.onrender.com";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,  // 15s — Render free tier cold starts can be slow
});

// ── Attach JWT to every request ───────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Handle 401 — try refresh, then redirect ───────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't intercept errors from the token endpoints themselves
    if (originalRequest.url?.includes("/api/token/")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refresh =
        localStorage.getItem("refresh") || sessionStorage.getItem("refresh");

      if (refresh) {
        try {
          const res = await axios.post(
            `${API_BASE}/api/token/refresh/`,
            { refresh },
            { timeout: 10000 }
          );
          const newAccess = res.data.access;
          localStorage.setItem("access", newAccess);
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        } catch {
          // Refresh failed — wipe tokens
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          sessionStorage.removeItem("refresh");
        }
      } else {
        localStorage.removeItem("access");
      }

      // Only redirect if we're not already on login page
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
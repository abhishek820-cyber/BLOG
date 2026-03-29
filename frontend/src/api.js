// src/api.js
// ── Axios instance that auto-attaches the JWT token to every request ────────
// Import this instead of plain axios in Home, Create, Edit, etc.
//
//   import api from "../api";
//   const res = await api.get("/api/posts/");

import axios from "axios";

const API_BASE = "https://blog-2hg9.onrender.com";

const api = axios.create({
  baseURL: API_BASE,
});

// Attach the JWT token to every outgoing request
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("access") || sessionStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If a 401 comes back (token expired), clear storage and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      sessionStorage.removeItem("access");
      sessionStorage.removeItem("refresh");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
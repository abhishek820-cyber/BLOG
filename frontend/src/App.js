import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Create from "./pages/Create";
import Edit from "./pages/Edit";
import About from "./pages/About";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import "./index.css";

// ── Protected route wrapper ──────────────────────────────────────────────────
function ProtectedRoute({ isAuthenticated, children }) {
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  // Persist login across page refreshes using localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem("isLoggedIn") === "true"
  );

  const login = () => {
    localStorage.setItem("isLoggedIn", "true");
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsAuthenticated(false);
  };

  return (
    <BrowserRouter>
      <Routes>

        {/* Public routes */}
        <Route
          path="/login"
          element={
            isAuthenticated
              ? <Navigate to="/" replace />
              : <Login onLogin={login} />
          }
        />
        <Route
          path="/signup"
          element={
            isAuthenticated
              ? <Navigate to="/" replace />
              : <Signup onLogin={login} />
          }
        />

        {/* Protected routes — redirect to /login if not authenticated */}
        <Route
          path="/"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Home onLogout={logout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Create onLogout={logout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit/:id"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Edit onLogout={logout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/about"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <About onLogout={logout} />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
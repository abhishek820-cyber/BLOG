import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Create from "./pages/Create";
import Edit from "./pages/Edit";
import About from "./pages/About";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import AllPosts from "./pages/AllPosts";
import "./index.css";

function ProtectedRoute({ isAuthenticated, children }) {
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function getToken() {
  return localStorage.getItem("access") || sessionStorage.getItem("access");
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getToken());

  const login = () => setIsAuthenticated(true);

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("rememberMe");
    sessionStorage.removeItem("access");
    sessionStorage.removeItem("refresh");
    setIsAuthenticated(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login"  element={isAuthenticated ? <Navigate to="/" replace /> : <Login onLogin={login} />} />
        <Route path="/signup" element={isAuthenticated ? <Navigate to="/" replace /> : <Signup />} />

        {/* Protected */}
        <Route path="/"        element={<ProtectedRoute isAuthenticated={isAuthenticated}><Home   onLogout={logout} /></ProtectedRoute>} />
        <Route path="/create"  element={<ProtectedRoute isAuthenticated={isAuthenticated}><Create onLogout={logout} /></ProtectedRoute>} />
        <Route path="/edit/:id" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Edit  onLogout={logout} /></ProtectedRoute>} />
        <Route path="/about"   element={<ProtectedRoute isAuthenticated={isAuthenticated}><About   onLogout={logout} /></ProtectedRoute>} />
        <Route path="/profile"   element={<ProtectedRoute isAuthenticated={isAuthenticated}><Profile  onLogout={logout} /></ProtectedRoute>} />
        <Route path="/all-posts"  element={<ProtectedRoute isAuthenticated={isAuthenticated}><AllPosts onLogout={logout} /></ProtectedRoute>} />

        {/* Catch-all — must be last */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
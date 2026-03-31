import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Layout({ children, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate("/login");
  };

  return (
    <div className="app">
      {/* ── HEADER ── */}
      <header className="site-header">
        <div className="header-top">
          <span className="header-date">{today}</span>
          <span className="header-tagline">Your thoughts, beautifully written</span>
        </div>
        <div className="header-main">
          <div className="header-rule" />
          <h1 className="site-title" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
            The Daily Post
          </h1>
          <div className="header-rule" />
        </div>
        <nav className="header-nav">
          <span
            className={location.pathname === "/" ? "nav-active" : ""}
            onClick={() => navigate("/")}
          >Home</span>
          <span className="nav-dot">·</span>
          <span
            className={location.pathname === "/create" ? "nav-active" : ""}
            onClick={() => navigate("/create")}
          >Write</span>
          <span className="nav-dot">·</span>
          <span
            className={location.pathname === "/about" ? "nav-active" : ""}
            onClick={() => navigate("/about")}
          >About</span>
          <span className="nav-dot">·</span>
          <span
            className={location.pathname === "/all-posts" ? "nav-active" : ""}
            onClick={() => navigate("/all-posts")}
          >Explore</span>
          <span className="nav-dot">·</span>
          <span
            className={location.pathname === "/profile" ? "nav-active" : ""}
            onClick={() => navigate("/profile")}
          >Profile</span>
          <span className="nav-dot">·</span>
          <span
            onClick={handleLogout}
            style={{ cursor: "pointer", color: "#c9a84c" }}
          >Logout</span>
        </nav>
      </header>

      <main className="main-content">{children}</main>

      {/* ── FOOTER ── */}
      <footer className="site-footer">
        <div className="footer-rule" />
        <p className="footer-text">The Daily Post &copy; {new Date().getFullYear()} — All rights reserved</p>
      </footer>
    </div>
  );
}

export default Layout;
import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";

const stats = [
  { value: "Create", label: "Stories" },
  { value: "Express", label: "Voices" },
  { value: "Connect", label: "Ideas" },
];

function About() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="about-page">

        {/* ── HERO ── */}
        <div className="about-hero">
          <p className="about-lead">
            A space for ideas, stories, and reflections — built for writers
            who believe that words still matter.
          </p>
        </div>

        {/* ── TECH STRIP ── */}
        <div className="about-stats">
          {stats.map(({ value, label }) => (
            <div key={label} className="about-stat">
              <span className="about-stat-value">{value}</span>
              <span className="about-stat-label">{label}</span>
            </div>
          ))}
        </div>

        {/* ── BODY ── */}
        <div className="about-body">
          <div className="about-content">

            <div className="about-block">
              <h3 className="about-block-title">The Mission</h3>
              <div className="about-block-rule" />
              <p className="about-text">
                The Daily Post is a modern blogging platform designed to keep the
                focus on what matters most — the writing. No clutter, no noise.
                Just a clean, distraction-free environment where your words can
                breathe and your ideas can find their shape.
              </p>
            </div>

            <div className="about-block">
              <h3 className="about-block-title">The Stack</h3>
              <div className="about-block-rule" />
              <p className="about-text">
                This is a full-stack application built with <strong>React</strong> on
                the frontend for a fast, responsive experience, and <strong>Django</strong> on
                the backend powering a clean REST API. Together they demonstrate how
                modern web applications can be crafted with both elegance and reliability.
              </p>
            </div>

            <div className="about-block">
              <h3 className="about-block-title">The Philosophy</h3>
              <div className="about-block-rule" />
              <p className="about-text">
                Whether you're writing your first post or your hundredth, every story
                deserves a stage worthy of it. The Daily Post is designed to make your
                content stand out — through typography that respects the reader, and
                an interface that gets out of your way.
              </p>
            </div>

          </div>

          {/* ── SIDEBAR ── */}
          <aside className="about-sidebar">
            <div className="about-author-card">
              <div className="author-avatar">AR</div>
              <div className="author-info">
                <span className="author-label">Created by</span>
                <span className="author-name">Abhishek RP</span>
              </div>
            </div>

            <div className="about-sidebar-card">
              <h4 className="sidebar-title">Quick Links</h4>
              <div className="sidebar-rule" />
              <ul className="about-links">
                <li onClick={() => navigate("/")}>← Back to Home</li>
                <li onClick={() => navigate("/create")}>✒ Write a Post</li>
              </ul>
            </div>

            <div className="about-sidebar-card about-sidebar-dark">
              <h4 className="sidebar-title sidebar-title-light">Built with</h4>
              <div className="sidebar-rule sidebar-rule-light" />
              <ul className="tech-list">
                <li><span className="tech-dot" />React 18</li>
                <li><span className="tech-dot" />React Router v6</li>
                <li><span className="tech-dot" />Django REST Framework</li>
                <li><span className="tech-dot" />Axios</li>
              </ul>
            </div>
          </aside>
        </div>

      </div>
    </Layout>
  );
}

export default About;
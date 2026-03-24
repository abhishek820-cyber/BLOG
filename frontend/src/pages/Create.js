import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";

function wordCount(text) {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

function readTime(text) {
  return Math.max(1, Math.ceil(wordCount(text) / 200));
}

function Create({ onLogout }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    api.post("/api/posts/", { title, content })
      .then(() => navigate("/"))
      .catch(() => setSubmitting(false));
  };

  const words = wordCount(content);
  const mins = readTime(content);
  const titleOk = title.trim().length > 0;
  const contentOk = content.trim().length > 0;

  return (
    <Layout onLogout={onLogout}>
        <div className="editor-layout">
        {/* ── EDITOR ── */}
        <section className="form-section editor-main">
          <div className="form-header">
            <h2 className="form-title">New Story</h2>
            <div className="form-rule" />
          </div>

          <form onSubmit={handleSubmit} className="post-form">
            <div className="field-group">
              <label className="field-label">Title</label>
              <input
                className="field-input"
                type="text"
                placeholder="Give your story a compelling title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
              />
              <div className="field-hint">{title.length}/120 characters</div>
            </div>

            <div className="field-group">
              <label className="field-label">Content</label>
              <textarea
                className="field-textarea field-textarea-tall"
                placeholder={`Start writing your story...\n\nTip: A great opening sentence pulls readers in immediately.`}
                rows={16}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            {/* Live stats bar */}
            <div className="editor-stats">
              <span className="stat-chip">{words} {words === 1 ? "word" : "words"}</span>
              <span className="stat-chip">{mins} min read</span>
              <span className={`stat-chip ${titleOk && contentOk ? "stat-ready" : "stat-pending"}`}>
                {titleOk && contentOk ? "✓ Ready to publish" : "Fill in title & content"}
              </span>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn-submit"
                disabled={!titleOk || !contentOk || submitting}
              >
                {submitting ? "Publishing…" : "Publish Story"}
              </button>
              <button type="button" className="btn-cancel" onClick={() => navigate("/")}>
                Discard
              </button>
            </div>
          </form>
        </section>

        {/* ── TIPS SIDEBAR ── */}
        <aside className="editor-sidebar">
          <div className="sidebar-card">
            <h3 className="sidebar-title">Writing Tips</h3>
            <div className="sidebar-rule" />
            <ul className="tips-list">
              <li>Start with a strong hook — your first sentence matters most.</li>
              <li>Use short paragraphs to improve readability.</li>
              <li>Write for one reader, not a crowd.</li>
              <li>Edit after you write — first drafts are meant to be messy.</li>
              <li>A good title makes readers curious, not just informed.</li>
            </ul>
          </div>

          <div className="sidebar-card sidebar-card-dark">
            <h3 className="sidebar-title sidebar-title-light">Quick Stats</h3>
            <div className="sidebar-rule sidebar-rule-light" />
            <div className="quick-stats">
              <div className="quick-stat">
                <span className="qs-value">{words}</span>
                <span className="qs-label">Words</span>
              </div>
              <div className="quick-stat">
                <span className="qs-value">{content.length}</span>
                <span className="qs-label">Characters</span>
              </div>
              <div className="quick-stat">
                <span className="qs-value">{mins}m</span>
                <span className="qs-label">Read time</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </Layout>
  );
}

export default Create;
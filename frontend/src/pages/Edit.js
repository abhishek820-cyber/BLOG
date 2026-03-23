import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "./Layout";

function wordCount(text) {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

function readTime(text) {
  return Math.max(1, Math.ceil(wordCount(text) / 200));
}

function Edit() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/api/posts/${id}/`)
      .then((res) => {
        setTitle(res.data.title);
        setContent(res.data.content);
        setLoading(false);
      })
      .catch(() => navigate("/"));
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    api.put(`/api/posts/${id}/`, { title, content })
      .then(() => navigate("/"))
      .catch(() => setSubmitting(false));
  };

  const words = wordCount(content);
  const mins = readTime(content);
  const titleOk = title.trim().length > 0;
  const contentOk = content.trim().length > 0;

  if (loading) {
    return (
      <Layout>
        <div className="loading-state">
          <div className="loading-dots"><span /><span /><span /></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="editor-layout">
        {/* ── EDITOR ── */}
        <section className="form-section editor-main">
          <div className="form-header">
            <div className="form-title-row">
              <h2 className="form-title">Edit Story</h2>
              <span className="edit-badge">Editing</span>
            </div>
            <div className="form-rule form-rule-gold" />
          </div>

          <form onSubmit={handleSubmit} className="post-form">
            <div className="field-group">
              <label className="field-label">Title</label>
              <input
                className="field-input"
                type="text"
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
                rows={16}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            {/* Live stats */}
            <div className="editor-stats">
              <span className="stat-chip">{words} {words === 1 ? "word" : "words"}</span>
              <span className="stat-chip">{mins} min read</span>
              <span className={`stat-chip ${titleOk && contentOk ? "stat-ready" : "stat-pending"}`}>
                {titleOk && contentOk ? "✓ Ready to update" : "Fill in all fields"}
              </span>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn-submit btn-update"
                disabled={!titleOk || !contentOk || submitting}
              >
                {submitting ? "Saving…" : "Save Changes"}
              </button>
              <button type="button" className="btn-cancel" onClick={() => navigate("/")}>
                Cancel
              </button>
            </div>
          </form>
        </section>

        {/* ── SIDEBAR ── */}
        <aside className="editor-sidebar">
          <div className="sidebar-card sidebar-card-dark">
            <h3 className="sidebar-title sidebar-title-light">Live Stats</h3>
            <div className="sidebar-rule sidebar-rule-light" />
            <div className="quick-stats">
              <div className="quick-stat">
                <span className="qs-value">{words}</span>
                <span className="qs-label">Words</span>
              </div>
              <div className="quick-stat">
                <span className="qs-value">{content.length}</span>
                <span className="qs-label">Chars</span>
              </div>
              <div className="quick-stat">
                <span className="qs-value">{mins}m</span>
                <span className="qs-label">Read</span>
              </div>
            </div>
          </div>

          <div className="sidebar-card">
            <h3 className="sidebar-title">Editing Tips</h3>
            <div className="sidebar-rule" />
            <ul className="tips-list">
              <li>Read your draft aloud to catch awkward phrasing.</li>
              <li>Cut words that don't add meaning.</li>
              <li>Check your opening — does it still hook?</li>
              <li>Make sure your ending lands with impact.</li>
            </ul>
          </div>
        </aside>
      </div>
    </Layout>
  );
}

export default Edit;
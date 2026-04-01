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

export default function Create({ onLogout }) {
  const [title,      setTitle]      = useState("");
  const [content,    setContent]    = useState("");
  const [submitting, setSubmitting] = useState(null); // 'draft' | 'published' | null
  const [saved,      setSaved]      = useState(null); // { status, id } after save
  const navigate = useNavigate();

  const handleSubmit = async (targetStatus) => {
    if (!title.trim() || !content.trim()) return;
    if (submitting) return;
    setSubmitting(targetStatus);
    try {
      const res = await api.post("/api/posts/", { title, content, status: targetStatus });
      if (targetStatus === "draft") {
        // Stay on page, show saved indicator — user can keep editing
        setSaved({ status: "draft", id: res.data.id });
        setSubmitting(null);
      } else {
        // Published — go home
        navigate("/");
      }
    } catch (err) {
      alert(`Error: ${JSON.stringify(err.response?.data)}`);
      setSubmitting(null);
    }
  };

  const words   = wordCount(content);
  const mins    = readTime(content);
  const canSave = title.trim().length > 0 && content.trim().length > 0;

  return (
    <Layout onLogout={onLogout}>
      <div className="editor-layout">

        {/* ── EDITOR ── */}
        <section className="form-section editor-main">
          <div className="form-header">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
              <h2 className="form-title">New Story</h2>
              {saved && (
                <span style={{
                  fontSize: 10, letterSpacing: 2, textTransform: "uppercase",
                  color: "#27ae60", background: "rgba(39,174,96,0.08)",
                  border: "1px solid rgba(39,174,96,0.25)",
                  padding: "3px 10px", borderRadius: 2,
                }}>
                  ✓ Draft saved
                </span>
              )}
            </div>
            <div className="form-rule" />
          </div>

          <div className="post-form">
            <div className="field-group">
              <label className="field-label">Title</label>
              <input
                className="field-input"
                type="text"
                placeholder="Give your story a compelling title…"
                value={title}
                onChange={e => { setTitle(e.target.value); setSaved(null); }}
                maxLength={120}
              />
              <div className="field-hint">{title.length}/120</div>
            </div>

            <div className="field-group">
              <label className="field-label">Content</label>
              <textarea
                className="field-textarea field-textarea-tall"
                rows={18}
                placeholder="Start writing your story…"
                value={content}
                onChange={e => { setContent(e.target.value); setSaved(null); }}
              />
            </div>

            {/* Live stats */}
            <div className="editor-stats">
              <span className="stat-chip">{words} {words === 1 ? "word" : "words"}</span>
              <span className="stat-chip">{mins} min read</span>
              <span className={`stat-chip ${canSave ? "stat-ready" : "stat-pending"}`}>
                {canSave ? "✓ Ready" : "Fill in title & content"}
              </span>
            </div>

            {/* Action buttons */}
            <div className="form-actions">

              {/* Save as Draft */}
              <button
                type="button"
                className="btn-cancel"
                style={{
                  borderColor: canSave ? "var(--accent, #c9a84c)" : undefined,
                  color: canSave ? "var(--accent, #c9a84c)" : undefined,
                  position: "relative", minWidth: 140,
                }}
                disabled={!canSave || !!submitting}
                onClick={() => handleSubmit("draft")}
              >
                {submitting === "draft" ? "Saving…" : "💾 Save Draft"}
              </button>

              {/* Publish */}
              <button
                type="button"
                className="btn-submit"
                disabled={!canSave || !!submitting}
                onClick={() => handleSubmit("published")}
              >
                {submitting === "published" ? "Publishing…" : "Publish Story →"}
              </button>

              <button
                type="button"
                className="btn-cancel"
                onClick={() => navigate("/")}
                disabled={!!submitting}
              >
                Discard
              </button>
            </div>

            {/* Explain the difference */}
            <p style={{
              marginTop: 12, fontSize: 11, color: "#b8b3ae",
              lineHeight: 1.6, letterSpacing: 0.2,
            }}>
              <strong style={{ color: "#6b6660" }}>Save Draft</strong> — stored privately in My Posts, not visible to others.&nbsp;
              <strong style={{ color: "#6b6660" }}>Publish</strong> — goes live in Explore for everyone to read.
            </p>
          </div>
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
            <h3 className="sidebar-title">Status</h3>
            <div className="sidebar-rule" />
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
              {[
                ["💾", "Draft",     "Saved privately. Only you can see it."],
                ["🌐", "Published", "Visible in Explore to all users."],
              ].map(([icon, label, desc]) => (
                <div key={label} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#1a1814" }}>{label}</div>
                    <div style={{ fontSize: 11, color: "#b8b3ae", lineHeight: 1.5 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sidebar-card">
            <h3 className="sidebar-title">Writing Tips</h3>
            <div className="sidebar-rule" />
            <ul className="tips-list">
              <li>Start strong — first sentence matters.</li>
              <li>Use short paragraphs for readability.</li>
              <li>Write for one specific reader.</li>
              <li>Save a draft first, edit, then publish.</li>
            </ul>
          </div>
        </aside>
      </div>
    </Layout>
  );
}
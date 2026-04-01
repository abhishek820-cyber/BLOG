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

export default function Edit({ onLogout }) {
  const [title,      setTitle]      = useState("");
  const [content,    setContent]    = useState("");
  const [postStatus, setPostStatus] = useState("draft"); // current status from DB
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(null);    // 'save' | 'publish' | 'unpublish'
  const [lastSaved,  setLastSaved]  = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/api/posts/${id}/`)
      .then(res => {
        setTitle(res.data.title);
        setContent(res.data.content);
        setPostStatus(res.data.status);
        setLoading(false);
      })
      .catch(() => navigate("/"));
  }, [id]);

  // Save changes (keep current status)
  const handleSave = async () => {
    if (!title.trim() || !content.trim() || submitting) return;
    setSubmitting("save");
    try {
      const res = await api.put(`/api/posts/${id}/`, { title, content, status: postStatus });
      setPostStatus(res.data.status);
      setLastSaved(new Date());
      setSubmitting(null);
    } catch {
      setSubmitting(null);
    }
  };

  // Publish a draft → goes live
  const handlePublish = async () => {
    if (!title.trim() || !content.trim() || submitting) return;
    setSubmitting("publish");
    try {
      // First save latest content, then publish
      await api.put(`/api/posts/${id}/`, { title, content, status: "draft" });
      await api.patch(`/api/posts/${id}/publish/`);
      navigate("/");
    } catch {
      setSubmitting(null);
    }
  };

  // Unpublish → move back to draft
  const handleUnpublish = async () => {
    if (submitting) return;
    setSubmitting("unpublish");
    try {
      await api.patch(`/api/posts/${id}/unpublish/`);
      setPostStatus("draft");
      setSubmitting(null);
    } catch {
      setSubmitting(null);
    }
  };

  const words   = wordCount(content);
  const mins    = readTime(content);
  const canSave = title.trim().length > 0 && content.trim().length > 0;
  const isDraft = postStatus === "draft";

  const fmtSaved = lastSaved
    ? `Saved at ${lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    : null;

  if (loading) {
    return (
      <Layout onLogout={onLogout}>
        <div className="loading-state">
          <div className="loading-dots"><span /><span /><span /></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout onLogout={onLogout}>
      <div className="editor-layout">

        {/* ── EDITOR ── */}
        <section className="form-section editor-main">
          <div className="form-header">
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 4 }}>
              <h2 className="form-title">Edit Story</h2>

              {/* Status badge */}
              <span style={{
                fontSize: 10, letterSpacing: 2, textTransform: "uppercase",
                padding: "3px 10px", borderRadius: 2,
                background: isDraft ? "rgba(180,140,50,0.1)" : "rgba(39,174,96,0.08)",
                border: `1px solid ${isDraft ? "rgba(201,168,76,0.4)" : "rgba(39,174,96,0.25)"}`,
                color: isDraft ? "#c9a84c" : "#27ae60",
              }}>
                {isDraft ? "💾 Draft" : "🌐 Published"}
              </span>

              {fmtSaved && (
                <span style={{ fontSize: 11, color: "#b8b3ae" }}>{fmtSaved}</span>
              )}
            </div>
            <div className="form-rule form-rule-gold" />
          </div>

          <div className="post-form">
            <div className="field-group">
              <label className="field-label">Title</label>
              <input
                className="field-input"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                maxLength={120}
              />
              <div className="field-hint">{title.length}/120</div>
            </div>

            <div className="field-group">
              <label className="field-label">Content</label>
              <textarea
                className="field-textarea field-textarea-tall"
                rows={16}
                value={content}
                onChange={e => setContent(e.target.value)}
              />
            </div>

            <div className="editor-stats">
              <span className="stat-chip">{words} {words === 1 ? "word" : "words"}</span>
              <span className="stat-chip">{mins} min read</span>
              <span className={`stat-chip ${canSave ? "stat-ready" : "stat-pending"}`}>
                {canSave ? "✓ Ready" : "Fill in all fields"}
              </span>
            </div>

            {/* Actions — differ based on draft vs published */}
            <div className="form-actions">

              {/* Save changes (always available) */}
              <button
                type="button"
                className="btn-submit btn-update"
                disabled={!canSave || !!submitting}
                onClick={handleSave}
              >
                {submitting === "save" ? "Saving…" : "Save Changes"}
              </button>

              {isDraft ? (
                /* Draft → Publish */
                <button
                  type="button"
                  className="btn-submit"
                  style={{ background: "#27ae60" }}
                  disabled={!canSave || !!submitting}
                  onClick={handlePublish}
                >
                  {submitting === "publish" ? "Publishing…" : "Publish →"}
                </button>
              ) : (
                /* Published → move back to Draft */
                <button
                  type="button"
                  className="btn-cancel"
                  style={{ borderColor: "#c9a84c", color: "#c9a84c" }}
                  disabled={!!submitting}
                  onClick={handleUnpublish}
                >
                  {submitting === "unpublish" ? "Unpublishing…" : "↩ Move to Draft"}
                </button>
              )}

              <button
                type="button"
                className="btn-cancel"
                onClick={() => navigate("/")}
                disabled={!!submitting}
              >
                Cancel
              </button>
            </div>

            <p style={{ marginTop: 12, fontSize: 11, color: "#b8b3ae", lineHeight: 1.6 }}>
              {isDraft
                ? <><strong style={{ color: "#6b6660" }}>Save Changes</strong> keeps it as a draft.&nbsp;
                    <strong style={{ color: "#6b6660" }}>Publish</strong> saves &amp; makes it live in Explore.</>
                : <><strong style={{ color: "#6b6660" }}>Save Changes</strong> updates the live post.&nbsp;
                    <strong style={{ color: "#6b6660" }}>Move to Draft</strong> hides it from Explore.</>
              }
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
            <h3 className="sidebar-title">Story Status</h3>
            <div className="sidebar-rule" />
            <div style={{ marginTop: 8 }}>
              <div style={{
                padding: "10px 14px", borderRadius: 2,
                background: isDraft ? "rgba(201,168,76,0.08)" : "rgba(39,174,96,0.08)",
                border: `1px solid ${isDraft ? "rgba(201,168,76,0.3)" : "rgba(39,174,96,0.2)"}`,
                fontSize: 13,
                color: isDraft ? "#c9a84c" : "#27ae60",
                fontWeight: 500,
              }}>
                {isDraft ? "💾 Saved as Draft" : "🌐 Published & Live"}
              </div>
              <p style={{ fontSize: 11, color: "#b8b3ae", marginTop: 8, lineHeight: 1.6 }}>
                {isDraft
                  ? "Only you can see this. Publish it when you're ready."
                  : "This post is visible to everyone in Explore."}
              </p>
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
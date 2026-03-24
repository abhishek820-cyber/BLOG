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

    if (!title.trim() || !content.trim()) {
      alert("Title and content are required!");
      return;
    }

    setSubmitting(true);

    api.post("/api/posts/", { title, content })
      .then((res) => {
        console.log("POST SUCCESS:", res.data);
        alert("Blog published successfully ✅");
        navigate("/");
      })
      .catch((err) => {
        console.error("POST ERROR:", err);

        // Show real error message
        if (err.response) {
          alert(`Error: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
        } else {
          alert("Network error or server not reachable");
        }

        setSubmitting(false);
      });
  };

  const words = wordCount(content);
  const mins = readTime(content);
  const titleOk = title.trim().length > 0;
  const contentOk = content.trim().length > 0;

  return (
    <Layout onLogout={onLogout}>
      <div className="editor-layout">
        
        {/* EDITOR */}
        <section className="form-section editor-main">
          <div className="form-header">
            <h2 className="form-title">New Story</h2>
            <div className="form-rule" />
          </div>

          <form onSubmit={handleSubmit} className="post-form">
            
            {/* TITLE */}
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

            {/* CONTENT */}
            <div className="field-group">
              <label className="field-label">Content</label>
              <textarea
                className="field-textarea field-textarea-tall"
                rows={16}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            {/* STATS */}
            <div className="editor-stats">
              <span className="stat-chip">{words} words</span>
              <span className="stat-chip">{mins} min read</span>
              <span className={`stat-chip ${titleOk && contentOk ? "stat-ready" : "stat-pending"}`}>
                {titleOk && contentOk ? "✓ Ready to publish" : "Fill in title & content"}
              </span>
            </div>

            {/* BUTTONS */}
            <div className="form-actions">
              <button
                type="submit"
                className="btn-submit"
                disabled={!titleOk || !contentOk || submitting}
              >
                {submitting ? "Publishing…" : "Publish Story"}
              </button>

              <button
                type="button"
                className="btn-cancel"
                onClick={() => navigate("/")}
              >
                Discard
              </button>
            </div>
          </form>
        </section>

        {/* SIDEBAR */}
        <aside className="editor-sidebar">
          <div className="sidebar-card">
            <h3 className="sidebar-title">Writing Tips</h3>
            <div className="sidebar-rule" />
            <ul className="tips-list">
              <li>Start strong — first sentence matters.</li>
              <li>Use short paragraphs.</li>
              <li>Write for one reader.</li>
              <li>Edit after writing.</li>
            </ul>
          </div>
        </aside>

      </div>
    </Layout>
  );
}

export default Create;
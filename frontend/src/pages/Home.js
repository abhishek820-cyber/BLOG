import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";

function readTime(text) {
  const words = text?.trim().split(/\s+/).length || 0;
  return Math.max(1, Math.ceil(words / 200));
}
function excerpt(text, len = 160) {
  if (!text) return "";
  return text.length > len ? text.slice(0, len).trimEnd() + "…" : text;
}
function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

export default function Home({ onLogout }) {
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("all"); // 'all' | 'draft' | 'published'
  const navigate = useNavigate();

  const [fetchError, setFetchError] = useState("");

  const fetchPosts = () => {
    setLoading(true);
    setFetchError("");
    api.get("/api/posts/")
      .then(res => {
        setPosts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        if (err.code === "ECONNABORTED" || !err.response) {
          setFetchError("Server is starting up. Refreshing in 10 seconds…");
          // Auto-retry once after 10s (Render cold start)
          setTimeout(fetchPosts, 10000);
        } else {
          setFetchError(`Could not load posts (${err.response?.status || "network error"}). Try refreshing.`);
        }
      });
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleDelete = (id) => {
    if (window.confirm("Permanently delete this post?")) {
      api.delete(`/api/posts/${id}/`).then(fetchPosts);
    }
  };

  const handlePublish = async (id) => {
    await api.patch(`/api/posts/${id}/publish/`);
    fetchPosts();
  };

  const handleUnpublish = async (id) => {
    await api.patch(`/api/posts/${id}/unpublish/`);
    fetchPosts();
  };

  const filtered = posts
    .filter(p => filter === "all" || p.status === filter)
    .filter(p =>
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.content?.toLowerCase().includes(search.toLowerCase())
    );

  const drafts    = posts.filter(p => p.status === "draft");
  const published = posts.filter(p => p.status === "published");

  return (
    <Layout onLogout={onLogout}>

      {/* ── TOOLBAR ── */}
      <div className="home-toolbar">
        <div className="search-wrap">
          <span className="search-icon">⌕</span>
          <input
            className="search-input"
            type="text"
            placeholder="Search your posts…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 6 }}>
          {[
            ["all",       `All (${posts.length})`],
            ["draft",     `Drafts (${drafts.length})`],
            ["published", `Published (${published.length})`],
          ].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              style={{
                padding: "8px 14px",
                fontSize: 11, letterSpacing: 1.5,
                textTransform: "uppercase",
                fontFamily: "inherit",
                cursor: "pointer",
                borderRadius: 2,
                border: filter === val ? "1.5px solid #1a1814" : "1.5px solid #e8e3dc",
                background: filter === val ? "#1a1814" : "transparent",
                color: filter === val ? "#fff" : "#6b6660",
                transition: "all 0.15s",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <button className="btn-new-post" onClick={() => navigate("/create")}>
          <span className="btn-plus">+</span> Write
        </button>
      </div>

      {/* ── Fetch error ── */}
      {fetchError && (
        <div style={{
          background: "rgba(192,57,43,0.06)", border: "1px solid rgba(192,57,43,0.2)",
          borderRadius: 2, padding: "10px 16px", marginBottom: 20,
          fontSize: 13, color: "#c0392b", display: "flex", alignItems: "center", gap: 8,
        }}>
          <span>⚠</span> {fetchError}
        </div>
      )}

      {/* ── Draft notice ── */}
      {drafts.length > 0 && filter !== "published" && (
        <div style={{
          background: "rgba(201,168,76,0.07)",
          border: "1px solid rgba(201,168,76,0.25)",
          borderRadius: 2, padding: "10px 16px",
          marginBottom: 24, fontSize: 13, color: "#6b6660",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span>💾</span>
          <span>
            You have <strong style={{ color: "#1a1814" }}>{drafts.length}</strong> unpublished {drafts.length === 1 ? "draft" : "drafts"}.
            Publish when you're ready.
          </span>
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <div className="loading-dots"><span /><span /><span /></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-quill">✒</div>
          <p className="empty-text">
            {search
              ? `No posts matching "${search}"`
              : filter === "draft"
              ? "No drafts yet. Start writing!"
              : filter === "published"
              ? "No published posts yet."
              : "No stories yet. Be the first to write."}
          </p>
          {!search && (
            <button
              className="btn-new-post"
              style={{ margin: "20px auto 0", display: "flex" }}
              onClick={() => navigate("/create")}
            >
              Start writing
            </button>
          )}
        </div>
      ) : (
        <div className="posts-list">
          {filtered.map((post, i) => (
            <article
              key={post.id}
              className="post-card"
              style={{ animationDelay: `${i * 60}ms`, position: "relative" }}
            >
              {/* Status badge */}
              <div style={{
                position: "absolute", top: 20, right: 20,
                fontSize: 9, letterSpacing: 2, textTransform: "uppercase",
                padding: "3px 8px", borderRadius: 2,
                background: post.status === "draft"
                  ? "rgba(201,168,76,0.1)" : "rgba(39,174,96,0.08)",
                border: post.status === "draft"
                  ? "1px solid rgba(201,168,76,0.35)" : "1px solid rgba(39,174,96,0.2)",
                color: post.status === "draft" ? "#c9a84c" : "#27ae60",
              }}>
                {post.status === "draft" ? "Draft" : "Published"}
              </div>

              <div className="post-meta">
                <span className="post-readtime">{readTime(post.content)} min read</span>
                <span className="meta-sep">·</span>
                <span className="post-date">{formatDate(post.updated_at || post.created_at)}</span>
              </div>

              <h2 className="post-title">{post.title}</h2>
              <p className="post-content">{excerpt(post.content)}</p>

              <div className="post-footer">
                <div className="post-rule" />
                <div className="post-actions">
                  <button
                    className="btn-action btn-edit"
                    onClick={() => navigate(`/edit/${post.id}`)}
                  >
                    Edit
                  </button>

                  {/* Publish / Unpublish quick toggle */}
                  {post.status === "draft" ? (
                    <button
                      className="btn-action"
                      style={{ color: "#27ae60", borderColor: "rgba(39,174,96,0.3)" }}
                      onClick={() => handlePublish(post.id)}
                    >
                      Publish →
                    </button>
                  ) : (
                    <button
                      className="btn-action"
                      style={{ color: "#c9a84c", borderColor: "rgba(201,168,76,0.3)" }}
                      onClick={() => handleUnpublish(post.id)}
                    >
                      ↩ Draft
                    </button>
                  )}

                  <button
                    className="btn-action btn-delete"
                    onClick={() => handleDelete(post.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </Layout>
  );
}
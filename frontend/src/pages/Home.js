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
  if (!dateStr) return new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const fetchPosts = () => {
    setLoading(true);
    api.get("/api/posts/")
      .then((res) => { setPosts(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleDelete = (id) => {
    if (window.confirm("Permanently delete this post?")) {
      api.delete(`/api/posts/${id}/`).then(() => fetchPosts());
    }
  };

  const filtered = posts.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.content?.toLowerCase().includes(search.toLowerCase())
  );

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <Layout>
      {/* ── SEARCH + WRITE ── */}
      <div className="home-toolbar">
        <div className="search-wrap">
          <span className="search-icon">⌕</span>
          <input
            className="search-input"
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="btn-new-post" onClick={() => navigate("/create")}>
          <span className="btn-plus">+</span> Write
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-dots">
            <span /><span /><span />
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-quill">✒</div>
          <p className="empty-text">
            {search ? `No posts matching "${search}"` : "No stories yet. Be the first to write."}
          </p>
          {!search && (
            <button className="btn-new-post" style={{ margin: "20px auto 0", display: "flex" }} onClick={() => navigate("/create")}>
              Start writing
            </button>
          )}
        </div>
      ) : (
        <>
          {/* ── FEATURED POST ── */}
          {featured && !search && (
            <div className="featured-section">
              <div className="section-label">Featured</div>
              <article className="post-card post-featured">
                <div className="post-meta">
                  <span className="post-issue">No. {String(posts.length).padStart(2, "0")}</span>
                  <span className="meta-sep">·</span>
                  <span className="post-readtime">{readTime(featured.content)} min read</span>
                  <span className="meta-sep">·</span>
                  <span className="post-date">{formatDate(featured.created_at)}</span>
                </div>
                <h2 className="post-title post-title-featured">{featured.title}</h2>
                <p className="post-content">{excerpt(featured.content, 280)}</p>
                <div className="post-footer">
                  <div className="post-rule" />
                  <div className="post-actions">
                    <button className="btn-action btn-read" onClick={() => navigate(`/edit/${featured.id}`)}>
                      Edit story →
                    </button>
                    <button className="btn-action btn-delete" onClick={() => handleDelete(featured.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            </div>
          )}

          {/* ── REST OF POSTS ── */}
          {(search ? filtered : rest).length > 0 && (
            <div className="posts-grid-section">
              {!search && <div className="section-label">All Posts</div>}
              <div className="posts-list">
                {(search ? filtered : rest).map((post, i) => (
                  <article
                    key={post.id}
                    className="post-card"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="post-meta">
                      <span className="post-issue">No. {String(posts.length - (search ? i : i + 1)).padStart(2, "0")}</span>
                      <span className="meta-sep">·</span>
                      <span className="post-readtime">{readTime(post.content)} min read</span>
                      <span className="meta-sep">·</span>
                      <span className="post-date">{formatDate(post.created_at)}</span>
                    </div>
                    <h2 className="post-title">{post.title}</h2>
                    <p className="post-content">{excerpt(post.content)}</p>
                    <div className="post-footer">
                      <div className="post-rule" />
                      <div className="post-actions">
                        <button className="btn-action btn-edit" onClick={() => navigate(`/edit/${post.id}`)}>
                          Edit
                        </button>
                        <button className="btn-action btn-delete" onClick={() => handleDelete(post.id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}

export default Home;
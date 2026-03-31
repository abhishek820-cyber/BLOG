import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Layout from "./Layout";

function readTime(text = "") {
  const w = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(w / 200));
}
function excerpt(text = "", len = 200) {
  return text.length > len ? text.slice(0, len).trimEnd() + "…" : text;
}
function formatDate(str) {
  if (!str) return "";
  return new Date(str).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}
function getInitials(name = "") {
  return name.slice(0, 2).toUpperCase();
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');
  :root {
    --cream: #faf8f5; --ink: #1a1814; --ink-soft: #6b6660;
    --ink-faint: #b8b3ae; --accent: #c9a84c; --accent-light: #f0e6cc;
    --border: #e8e3dc; --white: #ffffff; --error: #c0392b;
  }

  /* ── Toolbar ── */
  .ap-toolbar {
    display: flex; align-items: center; gap: 14px;
    margin-bottom: 36px; flex-wrap: wrap;
  }
  .ap-search-wrap {
    flex: 1; min-width: 220px; position: relative;
  }
  .ap-search-icon {
    position: absolute; left: 14px; top: 50%;
    transform: translateY(-50%);
    font-size: 16px; color: var(--ink-faint); pointer-events: none;
  }
  .ap-search {
    width: 100%; padding: 12px 16px 12px 42px;
    font-family: 'DM Sans', sans-serif; font-size: 14px;
    color: var(--ink); background: var(--white);
    border: 1.5px solid var(--border); border-radius: 2px;
    outline: none; transition: border-color 0.2s, box-shadow 0.2s;
  }
  .ap-search:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-light); }
  .ap-search::placeholder { color: var(--ink-faint); }
  .ap-count {
    font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
    color: var(--ink-faint); white-space: nowrap;
  }

  /* ── Post card ── */
  .ap-card {
    background: var(--white);
    border: 1px solid var(--border); border-radius: 3px;
    margin-bottom: 20px;
    transition: box-shadow 0.15s, border-color 0.15s;
    opacity: 0; animation: fadeUp 0.45s ease forwards;
  }
  .ap-card:hover { border-color: rgba(201,168,76,0.4); box-shadow: 0 4px 24px rgba(0,0,0,0.06); }

  .ap-card-body { padding: 28px 28px 0; }

  /* Author row */
  .ap-author-row {
    display: flex; align-items: center; gap: 12px; margin-bottom: 18px;
  }
  .ap-avatar {
    width: 40px; height: 40px; border-radius: 50%;
    background: linear-gradient(135deg, rgba(201,168,76,0.25), rgba(201,168,76,0.05));
    border: 2px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Playfair Display', serif;
    font-size: 14px; font-weight: 700; color: var(--accent);
    overflow: hidden; flex-shrink: 0;
  }
  .ap-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
  .ap-author-name { font-size: 13px; font-weight: 500; color: var(--ink); }
  .ap-author-date { font-size: 11px; color: var(--ink-faint); letter-spacing: 0.5px; }

  /* Post content */
  .ap-post-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(18px, 2.5vw, 24px); font-weight: 700;
    color: var(--ink); line-height: 1.25; margin-bottom: 10px;
    cursor: pointer; transition: color 0.15s;
  }
  .ap-post-title:hover { color: var(--accent); }
  .ap-post-excerpt {
    font-size: 14px; color: var(--ink-soft); line-height: 1.7; margin-bottom: 16px;
  }
  .ap-readtime {
    font-size: 10px; letter-spacing: 2.5px; text-transform: uppercase;
    color: var(--ink-faint); margin-bottom: 20px;
  }
  .ap-card-divider { border: none; border-top: 1px solid var(--border); margin: 0; }

  /* Action bar */
  .ap-actions {
    display: flex; align-items: center; gap: 0;
    padding: 0 8px;
  }
  .ap-action-btn {
    display: flex; align-items: center; gap: 7px;
    padding: 14px 16px;
    background: none; border: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; color: var(--ink-soft);
    transition: color 0.15s, background 0.15s;
    border-radius: 2px;
    letter-spacing: 0.3px;
  }
  .ap-action-btn:hover { color: var(--ink); background: var(--cream); }
  .ap-action-btn.liked { color: var(--error); }
  .ap-action-btn.liked .ap-like-icon { animation: pop 0.25s ease; }
  .ap-action-sep { width: 1px; height: 20px; background: var(--border); margin: 0 4px; }

  .ap-share-wrap { position: relative; margin-left: auto; }
  .ap-share-menu {
    position: absolute; right: 0; bottom: calc(100% + 8px);
    background: var(--white); border: 1px solid var(--border);
    border-radius: 3px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    min-width: 180px; overflow: hidden; z-index: 100;
  }
  .ap-share-item {
    display: flex; align-items: center; gap: 10px;
    padding: 11px 16px; font-size: 13px; color: var(--ink);
    cursor: pointer; transition: background 0.1s;
    border: none; background: none; width: 100%;
    font-family: 'DM Sans', sans-serif; text-align: left;
  }
  .ap-share-item:hover { background: var(--cream); }

  /* ── Comment section ── */
  .ap-comments {
    border-top: 1px solid var(--border);
    padding: 20px 28px;
    background: rgba(250,248,245,0.5);
  }
  .ap-comments-title {
    font-size: 10px; letter-spacing: 3px; text-transform: uppercase;
    color: var(--ink-faint); margin-bottom: 16px;
  }

  .comment-item {
    display: flex; gap: 12px; margin-bottom: 16px;
    opacity: 0; animation: fadeUp 0.3s ease forwards;
  }
  .comment-avatar {
    width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
    background: linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.05));
    border: 1.5px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Playfair Display', serif; font-size: 11px;
    font-weight: 700; color: var(--accent); overflow: hidden;
  }
  .comment-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
  .comment-bubble {
    flex: 1; background: var(--white);
    border: 1px solid var(--border); border-radius: 2px;
    padding: 10px 14px;
  }
  .comment-meta {
    display: flex; align-items: center; gap: 8px; margin-bottom: 4px;
  }
  .comment-user { font-size: 12px; font-weight: 500; color: var(--ink); }
  .comment-time { font-size: 10px; color: var(--ink-faint); }
  .comment-text { font-size: 13px; color: var(--ink-soft); line-height: 1.5; }
  .comment-delete {
    background: none; border: none; cursor: pointer;
    font-size: 10px; color: var(--ink-faint); margin-left: auto;
    transition: color 0.15s; padding: 0; font-family: 'DM Sans', sans-serif;
  }
  .comment-delete:hover { color: var(--error); }

  /* Comment input */
  .comment-form { display: flex; gap: 10px; margin-top: 8px; }
  .comment-input {
    flex: 1; padding: 10px 14px;
    font-family: 'DM Sans', sans-serif; font-size: 13px;
    color: var(--ink); background: var(--white);
    border: 1.5px solid var(--border); border-radius: 2px;
    outline: none; transition: border-color 0.2s, box-shadow 0.2s;
    resize: none;
  }
  .comment-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-light); }
  .comment-input::placeholder { color: var(--ink-faint); }
  .comment-submit {
    padding: 10px 18px; background: var(--ink); color: var(--white);
    border: none; border-radius: 2px; font-family: 'DM Sans', sans-serif;
    font-size: 10px; letter-spacing: 2.5px; text-transform: uppercase;
    cursor: pointer; transition: background 0.15s; white-space: nowrap;
    align-self: flex-end;
  }
  .comment-submit:hover { background: #2d2a26; }
  .comment-submit:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Empty / loading */
  .ap-empty {
    text-align: center; padding: 80px 20px;
  }
  .ap-empty-icon { font-size: 36px; opacity: 0.3; margin-bottom: 12px; }
  .ap-empty-text { font-size: 14px; color: var(--ink-faint); }

  /* Copied toast */
  .copy-toast {
    position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
    background: var(--ink); color: var(--white);
    padding: 10px 20px; border-radius: 2px;
    font-family: 'DM Sans', sans-serif; font-size: 12px; letter-spacing: 1.5px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2); z-index: 9999;
    animation: toastIn 0.2s ease;
  }

  @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pop { 0%{transform:scale(1)} 50%{transform:scale(1.35)} 100%{transform:scale(1)} }
  @keyframes toastIn { from { opacity:0; transform:translateX(-50%) translateY(10px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }

  @media(max-width:600px) {
    .ap-card-body { padding: 20px 16px 0; }
    .ap-comments { padding: 16px; }
    .ap-action-btn { padding: 12px 10px; font-size: 11px; }
  }
`;

// ── Post Card ──────────────────────────────────────────────────────────────────
function PostCard({ post, currentUsername, onLikeToggle, delay }) {
  const [showComments, setShowComments]   = useState(false);
  const [comments, setComments]           = useState([]);
  const [loadingCmts, setLoadingCmts]     = useState(false);
  const [commentText, setCommentText]     = useState("");
  const [submittingCmt, setSubmittingCmt] = useState(false);
  const [showShare, setShowShare]         = useState(false);
  const [toast, setToast]                 = useState(false);
  const shareRef = useRef(null);

  // Close share menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (shareRef.current && !shareRef.current.contains(e.target)) setShowShare(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const loadComments = () => {
    if (loadingCmts) return;
    setLoadingCmts(true);
    api.get(`/api/all-posts/${post.id}/comments/`)
      .then(res => { setComments(res.data); setLoadingCmts(false); })
      .catch(() => setLoadingCmts(false));
  };

  const handleToggleComments = () => {
    if (!showComments && comments.length === 0) loadComments();
    setShowComments(v => !v);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingCmt(true);
    try {
      const res = await api.post(`/api/all-posts/${post.id}/comments/`, { text: commentText.trim() });
      setComments(prev => [...prev, res.data]);
      setCommentText("");
    } finally {
      setSubmittingCmt(false);
    }
  };

  const handleDeleteComment = async (cid) => {
    if (!window.confirm("Delete this comment?")) return;
    await api.delete(`/api/comments/${cid}/`);
    setComments(prev => prev.filter(c => c.id !== cid));
  };

  // Share helpers
  const postUrl = `${window.location.origin}/post/${post.id}`;

  const copyLink = () => {
    navigator.clipboard.writeText(postUrl).then(() => {
      setToast(true);
      setShowShare(false);
      setTimeout(() => setToast(false), 2200);
    });
  };

  const shareVia = (platform) => {
    const text = encodeURIComponent(`"${post.title}" by ${post.author}`);
    const url  = encodeURIComponent(postUrl);
    const links = {
      twitter:   `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      whatsapp:  `https://wa.me/?text=${text}%20${url}`,
      telegram:  `https://t.me/share/url?url=${url}&text=${text}`,
      facebook:  `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    };
    window.open(links[platform], "_blank", "noopener,noreferrer,width=600,height=500");
    setShowShare(false);
  };

  return (
    <>
      <div className="ap-card" style={{ animationDelay: `${delay}s` }}>
        <div className="ap-card-body">

          {/* Author */}
          <div className="ap-author-row">
            <div className="ap-avatar">
              {post.author_avatar
                ? <img src={post.author_avatar} alt={post.author} />
                : getInitials(post.author)
              }
            </div>
            <div>
              <div className="ap-author-name">{post.author}</div>
              <div className="ap-author-date">{formatDate(post.created_at)}</div>
            </div>
          </div>

          {/* Content */}
          <div className="ap-post-title" onClick={handleToggleComments}>
            {post.title}
          </div>
          <p className="ap-post-excerpt">{excerpt(post.content)}</p>
          <p className="ap-readtime">{readTime(post.content)} min read</p>
        </div>

        <hr className="ap-card-divider" />

        {/* Actions */}
        <div className="ap-actions">
          {/* Like */}
          <button
            className={`ap-action-btn ${post.liked_by_me ? "liked" : ""}`}
            onClick={() => onLikeToggle(post.id)}
          >
            <span className="ap-like-icon">{post.liked_by_me ? "♥" : "♡"}</span>
            <span>{post.like_count} {post.like_count === 1 ? "like" : "likes"}</span>
          </button>

          <div className="ap-action-sep" />

          {/* Comments */}
          <button className="ap-action-btn" onClick={handleToggleComments}>
            <span>💬</span>
            <span>{post.comment_count} {post.comment_count === 1 ? "comment" : "comments"}</span>
          </button>

          {/* Share */}
          <div className="ap-share-wrap" ref={shareRef} style={{ marginLeft: "auto" }}>
            <button className="ap-action-btn" onClick={() => setShowShare(v => !v)}>
              <span>↗</span>
              <span>Share</span>
            </button>
            {showShare && (
              <div className="ap-share-menu">
                {[
                  ["🔗", "Copy link",       copyLink],
                  ["🐦", "Twitter / X",     () => shareVia("twitter")],
                  ["💬", "WhatsApp",         () => shareVia("whatsapp")],
                  ["✈️", "Telegram",          () => shareVia("telegram")],
                  ["📘", "Facebook",          () => shareVia("facebook")],
                ].map(([icon, label, action]) => (
                  <button key={label} className="ap-share-item" onClick={action}>
                    <span>{icon}</span> {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Comments panel */}
        {showComments && (
          <div className="ap-comments">
            <p className="ap-comments-title">
              {comments.length} {comments.length === 1 ? "comment" : "comments"}
            </p>

            {loadingCmts ? (
              <p style={{ fontSize: 13, color: "var(--ink-faint)" }}>Loading…</p>
            ) : (
              comments.map((c, i) => (
                <div key={c.id} className="comment-item" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="comment-avatar">
                    {c.avatar_url
                      ? <img src={c.avatar_url} alt={c.username} />
                      : getInitials(c.username)
                    }
                  </div>
                  <div className="comment-bubble">
                    <div className="comment-meta">
                      <span className="comment-user">{c.username}</span>
                      <span className="comment-time">{formatDate(c.created_at)}</span>
                      {c.username === currentUsername && (
                        <button className="comment-delete" onClick={() => handleDeleteComment(c.id)}>
                          delete
                        </button>
                      )}
                    </div>
                    <p className="comment-text">{c.text}</p>
                  </div>
                </div>
              ))
            )}

            {/* Add comment */}
            <form className="comment-form" onSubmit={handleAddComment}>
              <textarea
                className="comment-input"
                rows={2}
                placeholder="Write a comment…"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddComment(e); }
                }}
                maxLength={1000}
              />
              <button className="comment-submit" type="submit" disabled={submittingCmt || !commentText.trim()}>
                {submittingCmt ? "…" : "Post"}
              </button>
            </form>
          </div>
        )}
      </div>

      {toast && <div className="copy-toast">Link copied ✓</div>}
    </>
  );
}

// ── Main AllPosts page ─────────────────────────────────────────────────────────
export default function AllPosts({ onLogout }) {
  const [posts, setPosts]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [query, setQuery]       = useState("");  // debounced
  const [username, setUsername] = useState("");
  const navigate                = useNavigate();
  const debounceRef             = useRef(null);

  // Decode current username from JWT
  useEffect(() => {
    const token = localStorage.getItem("access") || sessionStorage.getItem("access");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUsername(payload.username || "");
      } catch {}
    }
  }, []);

  // Fetch posts (re-runs when query changes)
  useEffect(() => {
    setLoading(true);
    const params = query ? `?search=${encodeURIComponent(query)}` : "";
    api.get(`/api/all-posts/${params}`)
      .then(res => { setPosts(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [query]);

  // Debounce search input
  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setQuery(val), 400);
  };

  // Toggle like — optimistic UI update
  const handleLikeToggle = useCallback(async (postId) => {
    // Optimistic
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const liked = !p.liked_by_me;
      return { ...p, liked_by_me: liked, like_count: p.like_count + (liked ? 1 : -1) };
    }));
    try {
      const res = await api.post(`/api/all-posts/${postId}/like/`);
      // Sync with server
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, liked_by_me: res.data.liked, like_count: res.data.like_count } : p
      ));
    } catch {
      // Revert on failure
      setPosts(prev => prev.map(p => {
        if (p.id !== postId) return p;
        const liked = !p.liked_by_me;
        return { ...p, liked_by_me: liked, like_count: p.like_count + (liked ? 1 : -1) };
      }));
    }
  }, []);

  return (
    <Layout onLogout={onLogout}>
      <style>{styles}</style>

      {/* Toolbar */}
      <div className="ap-toolbar">
        <div className="ap-search-wrap">
          <span className="ap-search-icon">⌕</span>
          <input
            className="ap-search"
            type="text"
            placeholder="Search posts, authors…"
            value={search}
            onChange={handleSearch}
          />
        </div>
        <span className="ap-count">
          {loading ? "Loading…" : `${posts.length} ${posts.length === 1 ? "post" : "posts"}`}
        </span>
      </div>

      {/* Posts */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "var(--ink-faint)" }}>
          <div style={{ fontSize: 28, marginBottom: 12, opacity: 0.3 }}>◌</div>
          <p style={{ fontSize: 13, letterSpacing: 2 }}>LOADING POSTS…</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="ap-empty">
          <div className="ap-empty-icon">✒</div>
          <p className="ap-empty-text">
            {query ? `No posts found for "${query}"` : "No posts published yet."}
          </p>
        </div>
      ) : (
        posts.map((post, i) => (
          <PostCard
            key={post.id}
            post={post}
            currentUsername={username}
            onLikeToggle={handleLikeToggle}
            delay={i * 0.06}
          />
        ))
      )}
    </Layout>
  );
}
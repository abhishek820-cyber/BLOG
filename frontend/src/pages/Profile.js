import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Layout from "./Layout";

const API_BASE = "https://blog-2hg9.onrender.com";

function wordCount(text = "") {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}
function readTime(text = "") {
  return Math.max(1, Math.ceil(wordCount(text) / 200));
}
function formatDate(str) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
function getInitials(username = "") {
  return username.slice(0, 2).toUpperCase();
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --cream: #faf8f5; --ink: #1a1814; --ink-soft: #6b6660;
    --ink-faint: #b8b3ae; --accent: #c9a84c; --accent-light: #f0e6cc;
    --border: #e8e3dc; --white: #ffffff; --error: #c0392b; --success: #27ae60;
  }

  /* ── Cover banner ── */
  .cover-banner {
    height: 200px;
    background: var(--ink);
    position: relative;
    overflow: hidden;
  }
  .cover-banner::before {
    content: '';
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse at 20% 50%, rgba(201,168,76,0.15) 0%, transparent 55%),
      radial-gradient(ellipse at 80% 20%, rgba(201,168,76,0.08) 0%, transparent 50%);
  }
  .cover-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(255,202,44,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,202,44,0.04) 1px, transparent 1px);
    background-size: 48px 48px;
  }

  /* ── Profile header ── */
  .profile-header {
    max-width: 860px;
    margin: 0 auto;
    padding: 0 40px;
    position: relative;
  }

  /* Circle avatar — overlaps cover */
  .avatar-wrap {
    position: absolute;
    top: -56px;
    left: 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
  }

  .avatar-circle {
    width: 112px; height: 112px;
    border-radius: 50%;
    border: 4px solid var(--cream);
    background: linear-gradient(135deg, rgba(201,168,76,0.25), rgba(201,168,76,0.05));
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Playfair Display', serif;
    font-size: 36px;
    font-weight: 700;
    color: var(--accent);
    overflow: hidden;
    position: relative;
    cursor: pointer;
    transition: box-shadow 0.2s;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  }

  .avatar-circle:hover .avatar-overlay {
    opacity: 1;
  }

  .avatar-circle img {
    width: 100%; height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }

  .avatar-overlay {
    position: absolute; inset: 0;
    border-radius: 50%;
    background: rgba(26,24,20,0.65);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s;
    gap: 4px;
  }

  .avatar-overlay-icon { font-size: 20px; }
  .avatar-overlay-text {
    font-size: 9px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--white);
    font-family: 'DM Sans', sans-serif;
  }

  /* Avatar action buttons (shown below circle when has image) */
  .avatar-actions {
    display: flex;
    gap: 6px;
    margin-top: 8px;
  }

  .avatar-action-btn {
    padding: 4px 10px;
    font-size: 9px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    font-family: 'DM Sans', sans-serif;
    border-radius: 2px;
    cursor: pointer;
    transition: all 0.15s;
    border: 1px solid var(--border);
    background: var(--white);
    color: var(--ink-soft);
  }

  .avatar-action-btn:hover { border-color: var(--ink); color: var(--ink); }
  .avatar-action-btn.del { color: var(--error); border-color: rgba(192,57,43,0.25); }
  .avatar-action-btn.del:hover { background: rgba(192,57,43,0.06); border-color: rgba(192,57,43,0.5); }

  /* Hidden file input */
  .avatar-file-input { display: none; }

  /* Header info row */
  .profile-info-row {
    padding-top: 24px;
    padding-left: 140px; /* clear the avatar */
    padding-bottom: 24px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    opacity: 0;
    animation: fadeUp 0.5s ease 0.15s forwards;
  }

  .profile-name-block { flex: 1; }

  .profile-username {
    font-family: 'Playfair Display', serif;
    font-size: clamp(22px, 3vw, 32px);
    font-weight: 700;
    color: var(--ink);
    line-height: 1.1;
    margin-bottom: 6px;
  }

  .profile-bio-text {
    font-size: 14px;
    color: var(--ink-soft);
    line-height: 1.6;
    max-width: 420px;
  }

  .profile-bio-text.empty {
    font-style: italic;
    color: var(--ink-faint);
  }

  .btn-edit-profile {
    padding: 9px 18px;
    background: var(--white);
    color: var(--ink);
    border: 1.5px solid var(--border);
    border-radius: 2px;
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.15s;
    flex-shrink: 0;
    margin-top: 4px;
  }

  .btn-edit-profile:hover { border-color: var(--ink); }

  /* Divider */
  .profile-divider {
    border: none;
    border-top: 1px solid var(--border);
    margin: 0;
  }

  /* ── Stats bar ── */
  .stats-bar {
    max-width: 860px;
    margin: 0 auto;
    padding: 0 40px;
    display: flex;
    gap: 0;
    opacity: 0;
    animation: fadeUp 0.5s ease 0.25s forwards;
  }

  .stat-item {
    padding: 18px 32px 18px 0;
    margin-right: 32px;
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column; gap: 3px;
  }
  .stat-item:last-child { border-right: none; margin-right: 0; }
  .stat-num {
    font-family: 'Playfair Display', serif;
    font-size: 26px; font-weight: 700; color: var(--ink); line-height: 1;
  }
  .stat-lbl { font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: var(--ink-faint); }

  /* ── Body layout ── */
  .profile-body {
    max-width: 860px;
    margin: 0 auto;
    padding: 40px 40px;
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 40px;
    align-items: start;
  }

  /* ── Edit bio card ── */
  .edit-card {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 2px;
    padding: 24px;
    margin-bottom: 28px;
    opacity: 0;
    animation: fadeUp 0.4s ease 0.1s forwards;
  }

  .edit-card-title {
    font-family: 'Playfair Display', serif;
    font-size: 17px; font-weight: 700; color: var(--ink);
    margin-bottom: 16px;
  }

  .edit-field { margin-bottom: 16px; }

  .edit-label {
    display: block; font-size: 10px; font-weight: 500;
    letter-spacing: 2.5px; text-transform: uppercase;
    color: var(--ink-soft); margin-bottom: 7px;
  }

  .edit-input, .edit-textarea {
    width: 100%;
    padding: 11px 13px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; color: var(--ink);
    background: var(--cream);
    border: 1.5px solid var(--border); border-radius: 2px;
    outline: none; resize: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .edit-input:focus, .edit-textarea:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-light);
    background: var(--white);
  }

  .edit-input::placeholder, .edit-textarea::placeholder { color: var(--ink-faint); }

  .edit-actions { display: flex; gap: 10px; margin-top: 16px; }

  .btn-save {
    padding: 10px 22px;
    background: var(--ink); color: var(--white);
    border: none; border-radius: 2px;
    font-family: 'DM Sans', sans-serif;
    font-size: 10px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase;
    cursor: pointer; transition: background 0.15s;
  }
  .btn-save:hover { background: #2d2a26; }
  .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

  .btn-cancel-sm {
    padding: 10px 18px;
    background: transparent; color: var(--ink-soft);
    border: 1.5px solid var(--border); border-radius: 2px;
    font-family: 'DM Sans', sans-serif;
    font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
    cursor: pointer; transition: border-color 0.15s, color 0.15s;
  }
  .btn-cancel-sm:hover { border-color: var(--ink); color: var(--ink); }

  .feedback {
    font-size: 12px; margin-top: 10px; padding: 8px 12px; border-radius: 2px;
  }
  .feedback.ok  { color: var(--success); background: rgba(39,174,96,0.08); border: 1px solid rgba(39,174,96,0.2); }
  .feedback.err { color: var(--error);   background: rgba(192,57,43,0.06); border: 1px solid rgba(192,57,43,0.15); }

  /* ── Section heading ── */
  .sec-heading {
    font-size: 9px; letter-spacing: 4px; text-transform: uppercase;
    color: var(--ink-faint); margin-bottom: 16px;
    display: flex; align-items: center; gap: 10px;
  }
  .sec-heading::after { content: ''; flex: 1; height: 1px; background: var(--border); }

  /* ── Mini post cards ── */
  .mini-post {
    background: var(--white);
    border: 1px solid var(--border); border-radius: 2px;
    padding: 18px; margin-bottom: 10px;
    transition: border-color 0.15s, box-shadow 0.15s;
    opacity: 0;
    animation: fadeUp 0.45s ease forwards;
  }
  .mini-post:hover { border-color: rgba(201,168,76,0.5); box-shadow: 0 2px 12px rgba(201,168,76,0.08); }

  .mini-meta {
    font-size: 9px; letter-spacing: 2px; text-transform: uppercase;
    color: var(--ink-faint); margin-bottom: 7px; display: flex; gap: 8px;
  }
  .mini-title {
    font-family: 'Playfair Display', serif;
    font-size: 15px; font-weight: 700; color: var(--ink);
    line-height: 1.3; margin-bottom: 5px;
  }
  .mini-excerpt {
    font-size: 13px; color: var(--ink-soft); line-height: 1.5;
    display: -webkit-box; -webkit-line-clamp: 2;
    -webkit-box-orient: vertical; overflow: hidden;
  }
  .mini-actions {
    display: flex; gap: 14px; margin-top: 12px;
    padding-top: 10px; border-top: 1px solid var(--border);
  }
  .mini-btn {
    font-size: 9px; letter-spacing: 2px; text-transform: uppercase;
    color: var(--ink-faint); background: none; border: none;
    cursor: pointer; padding: 0; font-family: 'DM Sans', sans-serif;
    transition: color 0.15s;
  }
  .mini-btn:hover { color: var(--ink); }
  .mini-btn.del:hover { color: var(--error); }

  .empty-state {
    text-align: center; padding: 48px 20px;
    border: 1px dashed var(--border); border-radius: 2px;
  }
  .empty-icon { font-size: 28px; opacity: 0.35; margin-bottom: 10px; }
  .empty-text { font-size: 13px; color: var(--ink-faint); }

  /* ── Sidebar ── */
  .sidebar-card {
    background: var(--white);
    border: 1px solid var(--border); border-radius: 2px;
    padding: 22px; margin-bottom: 14px;
    opacity: 0; animation: fadeUp 0.5s ease 0.45s forwards;
  }
  .sidebar-card-title {
    font-size: 9px; letter-spacing: 4px; text-transform: uppercase;
    color: var(--ink-faint); margin-bottom: 14px;
  }
  .info-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 9px 0; border-bottom: 1px solid var(--border);
    font-size: 13px;
  }
  .info-row:last-child { border-bottom: none; padding-bottom: 0; }
  .info-key { color: var(--ink-soft); }
  .info-val { color: var(--ink); font-weight: 500; text-align: right; max-width: 140px; word-break: break-word; }

  .pw-toggle {
    font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
    color: var(--ink-soft); background: none; border: none; cursor: pointer;
    padding: 0; font-family: 'DM Sans', sans-serif;
    text-decoration: underline; text-underline-offset: 3px; transition: color 0.15s;
  }
  .pw-toggle:hover { color: var(--ink); }

  .btn-danger {
    width: 100%; padding: 10px;
    background: transparent; color: var(--error);
    border: 1.5px solid rgba(192,57,43,0.25); border-radius: 2px;
    font-family: 'DM Sans', sans-serif;
    font-size: 10px; letter-spacing: 2.5px; text-transform: uppercase;
    cursor: pointer; transition: background 0.15s, border-color 0.15s; margin-top: 6px;
  }
  .btn-danger:hover { background: rgba(192,57,43,0.06); border-color: rgba(192,57,43,0.5); }

  /* Avatar upload progress */
  .upload-hint {
    font-size: 11px; color: var(--ink-faint); margin-top: 6px; text-align: center;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 700px) {
    .profile-header, .stats-bar, .profile-body { padding-left: 16px; padding-right: 16px; }
    .profile-info-row { padding-left: 0; flex-direction: column; padding-top: 64px; }
    .avatar-wrap { top: -48px; left: 50%; transform: translateX(-50%); align-items: center; }
    .profile-body { grid-template-columns: 1fr; }
    .stat-item { padding: 14px 16px 14px 0; margin-right: 16px; }
  }
`;

export default function Profile({ onLogout }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [username, setUsername]     = useState("");
  const [bio, setBio]               = useState("");
  const [editBio, setEditBio]       = useState("");
  const [avatarUrl, setAvatarUrl]   = useState(null);
  const [editing, setEditing]       = useState(false);
  const [savingBio, setSavingBio]   = useState(false);
  const [bioFeedback, setBioFeedback] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [showPwForm, setShowPwForm] = useState(false);
  const [pwForm, setPwForm]         = useState({ current: "", next: "", confirm: "" });
  const [pwFeedback, setPwFeedback] = useState(null);
  const [savingPw, setSavingPw]     = useState(false);

  const [posts, setPosts]           = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // ── Load profile + posts ─────────────────────────────────────────────────
  useEffect(() => {
    // Decode username from JWT
    const token = localStorage.getItem("access") || sessionStorage.getItem("access");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUsername(payload.username || "User");
      } catch { setUsername("User"); }
    }

    // Fetch profile from backend (bio + avatar)
    api.get("/api/profile/")
      .then(res => {
        setBio(res.data.bio || "");
        setEditBio(res.data.bio || "");
        setAvatarUrl(res.data.avatar_url || null);
      })
      .catch(() => {});

    // Fetch posts
    api.get("/api/posts/")
      .then(res => { setPosts(res.data); setLoadingPosts(false); })
      .catch(() => setLoadingPosts(false));
  }, []);

  // ── Save bio ──────────────────────────────────────────────────────────────
  const handleSaveBio = async () => {
    setSavingBio(true);
    try {
      const res = await api.patch("/api/profile/", { bio: editBio });
      setBio(res.data.bio);
      setEditBio(res.data.bio);
      setEditing(false);
      setBioFeedback({ type: "ok", msg: "Bio updated successfully." });
      setTimeout(() => setBioFeedback(null), 3000);
    } catch {
      setBioFeedback({ type: "err", msg: "Could not save bio. Try again." });
    } finally {
      setSavingBio(false);
    }
  };

  // ── Upload avatar ─────────────────────────────────────────────────────────
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview immediately
    const previewUrl = URL.createObjectURL(file);
    setAvatarUrl(previewUrl);
    setUploadingAvatar(true);

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await api.patch("/api/profile/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAvatarUrl(res.data.avatar_url);
    } catch {
      setBioFeedback({ type: "err", msg: "Avatar upload failed. Try a smaller image." });
      setAvatarUrl(null);
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  // ── Delete avatar ─────────────────────────────────────────────────────────
  const handleDeleteAvatar = async () => {
    if (!window.confirm("Remove your profile photo?")) return;
    try {
      await api.delete("/api/profile/avatar/");
      setAvatarUrl(null);
    } catch {
      setBioFeedback({ type: "err", msg: "Could not remove avatar." });
    }
  };

  // ── Change password ───────────────────────────────────────────────────────
  const handleChangePw = async (e) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) {
      setPwFeedback({ type: "err", msg: "New passwords don't match." });
      return;
    }
    if (pwForm.next.length < 8) {
      setPwFeedback({ type: "err", msg: "Password must be at least 8 characters." });
      return;
    }
    setSavingPw(true);
    try {
      await api.post("/api/change-password/", {
        old_password: pwForm.current,
        new_password: pwForm.next,
      });
      setPwFeedback({ type: "ok", msg: "Password changed." });
      setPwForm({ current: "", next: "", confirm: "" });
      setShowPwForm(false);
      setTimeout(() => setPwFeedback(null), 4000);
    } catch (err) {
      setPwFeedback({ type: "err", msg: err.response?.data?.error || "Failed to change password." });
    } finally {
      setSavingPw(false);
    }
  };

  // ── Delete post ───────────────────────────────────────────────────────────
  const handleDelete = (id) => {
    if (!window.confirm("Delete this post permanently?")) return;
    api.delete(`/api/posts/${id}/`)
      .then(() => setPosts(prev => prev.filter(p => p.id !== id)));
  };

  const totalWords = posts.reduce((acc, p) => acc + wordCount(p.content), 0);

  return (
    <Layout onLogout={onLogout}>
      <style>{styles}</style>

      {/* ── COVER BANNER ── */}
      <div className="cover-banner">
        <div className="cover-grid" />
      </div>

      {/* ── PROFILE HEADER ── */}
      <div style={{ background: "var(--white)", borderBottom: "1px solid var(--border)" }}>
        <div className="profile-header">

          {/* Circular avatar — overlaps banner */}
          <div className="avatar-wrap">
            <div
              className="avatar-circle"
              onClick={() => fileInputRef.current?.click()}
              title="Click to change photo"
            >
              {avatarUrl
                ? <img src={avatarUrl} alt={username} />
                : <span>{getInitials(username)}</span>
              }
              <div className="avatar-overlay">
                <span className="avatar-overlay-icon">
                  {uploadingAvatar ? "⏳" : "📷"}
                </span>
                <span className="avatar-overlay-text">
                  {uploadingAvatar ? "Uploading…" : "Change"}
                </span>
              </div>
            </div>

            {/* Edit / Delete buttons shown below avatar when image exists */}
            {avatarUrl && (
              <div className="avatar-actions">
                <button className="avatar-action-btn" onClick={() => fileInputRef.current?.click()}>
                  Edit
                </button>
                <button className="avatar-action-btn del" onClick={handleDeleteAvatar}>
                  Delete
                </button>
              </div>
            )}

            {!avatarUrl && (
              <p className="upload-hint">Click to add photo</p>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="avatar-file-input"
              onChange={handleAvatarChange}
            />
          </div>

          {/* Name + bio + edit button */}
          <div className="profile-info-row">
            <div className="profile-name-block">
              <h1 className="profile-username">{username}</h1>
              <p className={`profile-bio-text ${!bio ? "empty" : ""}`}>
                {bio || "No bio yet — click Edit profile to add one."}
              </p>
            </div>
            <button
              className="btn-edit-profile"
              onClick={() => { setEditing(true); setEditBio(bio); }}
            >
              Edit profile
            </button>
          </div>
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div style={{ background: "var(--cream)", borderBottom: "1px solid var(--border)" }}>
        <div className="stats-bar">
          {[
            ["Posts", posts.length],
            ["Words written", totalWords.toLocaleString()],
            ["Avg. read time", posts.length ? `${Math.ceil(totalWords / posts.length / 200)} min` : "—"],
          ].map(([lbl, val]) => (
            <div key={lbl} className="stat-item">
              <span className="stat-num">{val}</span>
              <span className="stat-lbl">{lbl}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="profile-body">

        {/* ── LEFT ── */}
        <div>

          {/* Bio edit form */}
          {editing && (
            <div className="edit-card">
              <p className="edit-card-title">Edit profile</p>
              <div className="edit-field">
                <label className="edit-label">Bio</label>
                <textarea
                  className="edit-textarea"
                  rows={4}
                  placeholder="Write a short bio about yourself…"
                  value={editBio}
                  onChange={e => setEditBio(e.target.value)}
                  maxLength={300}
                />
                <div style={{ fontSize: 10, color: "var(--ink-faint)", marginTop: 3 }}>
                  {editBio.length} / 300
                </div>
              </div>
              <div className="edit-actions">
                <button className="btn-save" onClick={handleSaveBio} disabled={savingBio}>
                  {savingBio ? "Saving…" : "Save"}
                </button>
                <button className="btn-cancel-sm" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </div>
              {bioFeedback && <div className={`feedback ${bioFeedback.type}`}>{bioFeedback.msg}</div>}
            </div>
          )}

          {/* Posts */}
          <div className="sec-heading">Your stories</div>

          {loadingPosts ? (
            <div style={{ textAlign: "center", padding: 40, color: "var(--ink-faint)", fontSize: 13 }}>
              Loading…
            </div>
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✒</div>
              <p className="empty-text">No stories yet.</p>
              <button
                style={{ marginTop: 14, padding: "9px 18px", background: "var(--ink)", color: "var(--white)", border: "none", borderRadius: 2, fontFamily: "'DM Sans',sans-serif", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", cursor: "pointer" }}
                onClick={() => navigate("/create")}
              >
                Write your first post
              </button>
            </div>
          ) : (
            posts.map((post, i) => (
              <div
                key={post.id}
                className="mini-post"
                style={{ animationDelay: `${0.3 + i * 0.06}s` }}
              >
                <div className="mini-meta">
                  <span>{formatDate(post.created_at)}</span>
                  <span>·</span>
                  <span>{wordCount(post.content)} words</span>
                  <span>·</span>
                  <span>{readTime(post.content)} min read</span>
                </div>
                <div className="mini-title">{post.title}</div>
                <div className="mini-excerpt">{post.content}</div>
                <div className="mini-actions">
                  <button className="mini-btn" onClick={() => navigate(`/edit/${post.id}`)}>Edit</button>
                  <button className="mini-btn del" onClick={() => handleDelete(post.id)}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── SIDEBAR ── */}
        <aside>

          <div className="sidebar-card">
            <p className="sidebar-card-title">Account</p>
            {[
              ["Username", username],
              ["Total posts", posts.length],
              ["Total words", totalWords.toLocaleString()],
            ].map(([k, v]) => (
              <div key={k} className="info-row">
                <span className="info-key">{k}</span>
                <span className="info-val">{v}</span>
              </div>
            ))}
          </div>

          <div className="sidebar-card">
            <p className="sidebar-card-title">Security</p>
            <button className="pw-toggle" onClick={() => setShowPwForm(v => !v)}>
              {showPwForm ? "Cancel" : "Change password"}
            </button>
            {showPwForm && (
              <form onSubmit={handleChangePw} style={{ marginTop: 18 }}>
                {[
                  ["Current password", "current", "current-password"],
                  ["New password",     "next",    "new-password"],
                  ["Confirm new",      "confirm", "new-password"],
                ].map(([lbl, field, auto]) => (
                  <div key={field} className="edit-field" style={{ marginBottom: 14 }}>
                    <label className="edit-label">{lbl}</label>
                    <input
                      className="edit-input"
                      type="password"
                      autoComplete={auto}
                      value={pwForm[field]}
                      onChange={e => setPwForm(f => ({ ...f, [field]: e.target.value }))}
                      required
                    />
                  </div>
                ))}
                <button className="btn-save" type="submit" disabled={savingPw} style={{ width: "100%" }}>
                  {savingPw ? "Saving…" : "Update password"}
                </button>
                {pwFeedback && <div className={`feedback ${pwFeedback.type}`}>{pwFeedback.msg}</div>}
              </form>
            )}
          </div>

          <div className="sidebar-card">
            <p className="sidebar-card-title">Session</p>
            <button className="btn-danger" onClick={() => {
              if (window.confirm("Log out?")) onLogout();
            }}>
              Log out
            </button>
          </div>

        </aside>
      </div>
    </Layout>
  );
}
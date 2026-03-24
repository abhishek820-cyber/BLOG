import { useState } from "react";
import { useNavigate } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --cream: #faf8f5;
    --ink: #1a1814;
    --ink-soft: #6b6660;
    --ink-faint: #b8b3ae;
    --accent: #c9a84c;
    --accent-light: #f0e6cc;
    --border: #e8e3dc;
    --white: #ffffff;
  }

  body {
    background: var(--cream);
    font-family: 'DM Sans', sans-serif;
    color: var(--ink);
    min-height: 100vh;
  }

  .page {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .left {
    background: var(--ink);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 56px 64px;
    position: relative;
    overflow: hidden;
  }

  .left::before {
    content: '';
    position: absolute;
    top: -120px; right: -120px;
    width: 480px; height: 480px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%);
    pointer-events: none;
  }

  .left::after {
    content: '';
    position: absolute;
    bottom: -80px; left: -80px;
    width: 360px; height: 360px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%);
    pointer-events: none;
  }

  .left-logo {
    display: flex;
    align-items: center;
    gap: 12px;
    opacity: 0;
    animation: fadeUp 0.6s ease 0.1s forwards;
  }

  .logo-icon {
    width: 36px; height: 36px;
    position: relative;
  }

  .logo-icon span {
    position: absolute;
    width: 18px; height: 18px;
    border: 2px solid var(--accent);
    border-radius: 3px;
  }

  .logo-icon span:first-child { top: 0; left: 0; }
  .logo-icon span:last-child {
    bottom: 0; right: 0;
    background: rgba(201,168,76,0.2);
  }

  .logo-text {
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    font-size: 15px;
    letter-spacing: 3px;
    color: var(--white);
    text-transform: uppercase;
  }

  .left-body {
    opacity: 0;
    animation: fadeUp 0.7s ease 0.3s forwards;
  }

  .left-eyebrow {
    font-size: 11px;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 24px;
  }

  .left-headline {
    font-family: 'Playfair Display', serif;
    font-size: clamp(36px, 3.5vw, 52px);
    font-weight: 400;
    line-height: 1.15;
    color: var(--white);
    margin-bottom: 24px;
  }

  .left-headline em {
    font-style: italic;
    color: var(--accent);
  }

  .left-desc {
    font-size: 15px;
    line-height: 1.7;
    color: rgba(255,255,255,0.45);
    max-width: 340px;
  }

  .left-footer {
    opacity: 0;
    animation: fadeUp 0.7s ease 0.5s forwards;
  }

  .issue-tag {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 10px 16px;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 2px;
  }

  .issue-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--accent);
  }

  .issue-text {
    font-size: 12px;
    letter-spacing: 2px;
    color: rgba(255,255,255,0.4);
    text-transform: uppercase;
  }

  .right {
    background: var(--cream);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 56px 64px;
  }

  .form-wrap {
    width: 100%;
    max-width: 380px;
  }

  .form-header {
    margin-bottom: 48px;
    opacity: 0;
    animation: fadeUp 0.6s ease 0.2s forwards;
  }

  .form-eyebrow {
    font-size: 11px;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: var(--ink-faint);
    margin-bottom: 12px;
  }

  .form-title {
    font-family: 'Playfair Display', serif;
    font-size: 34px;
    font-weight: 700;
    color: var(--ink);
    line-height: 1.2;
    margin-bottom: 8px;
  }

  .form-subtitle {
    font-size: 14px;
    color: var(--ink-soft);
    line-height: 1.6;
  }

  .field {
    margin-bottom: 24px;
    opacity: 0;
    animation: fadeUp 0.6s ease forwards;
  }

  .field:nth-child(1) { animation-delay: 0.35s; }
  .field:nth-child(2) { animation-delay: 0.45s; }

  .field-label {
    display: block;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--ink-soft);
    margin-bottom: 10px;
  }

  .field-input-wrap { position: relative; }

  .field-input {
    width: 100%;
    padding: 14px 16px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    color: var(--ink);
    background: var(--white);
    border: 1.5px solid var(--border);
    border-radius: 2px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    appearance: none;
  }

  .field-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-light);
  }

  .field-input::placeholder { color: var(--ink-faint); }

  .toggle-pw {
    position: absolute;
    right: 14px; top: 50%;
    transform: translateY(-50%);
    background: none; border: none;
    cursor: pointer;
    color: var(--ink-faint);
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    letter-spacing: 0.5px;
    padding: 4px;
    transition: color 0.15s;
  }

  .toggle-pw:hover { color: var(--ink); }

  .options-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32px;
    opacity: 0;
    animation: fadeUp 0.6s ease 0.55s forwards;
  }

  .remember {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  .remember-box {
    width: 16px; height: 16px;
    border: 1.5px solid var(--border);
    border-radius: 2px;
    background: var(--white);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
    flex-shrink: 0;
  }

  .remember-box.checked {
    background: var(--ink);
    border-color: var(--ink);
  }

  .remember-box.checked::after {
    content: '';
    width: 8px; height: 5px;
    border-left: 1.5px solid white;
    border-bottom: 1.5px solid white;
    transform: rotate(-45deg) translateY(-1px);
  }

  .remember-label {
    font-size: 13px;
    color: var(--ink-soft);
    user-select: none;
  }

  .forgot-link {
    font-size: 13px;
    color: var(--ink-soft);
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: color 0.15s, border-color 0.15s;
  }

  .forgot-link:hover {
    color: var(--ink);
    border-bottom-color: var(--ink);
  }

  .submit-btn {
    width: 100%;
    padding: 16px;
    background: var(--ink);
    color: var(--white);
    border: none;
    border-radius: 2px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 3px;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s;
    margin-bottom: 20px;
    opacity: 0;
    animation: fadeUp 0.6s ease 0.65s forwards;
    position: relative;
    overflow: hidden;
  }

  .submit-btn:hover { background: #2d2a26; }
  .submit-btn:active { transform: scale(0.99); }

  .submit-btn.loading {
    pointer-events: none;
    color: transparent;
  }

  .submit-btn.loading::after {
    content: '';
    position: absolute;
    inset: 0;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='20' height='20'%3E%3Ccircle cx='12' cy='12' r='10' fill='none' stroke='white' stroke-width='2' stroke-dasharray='40' stroke-dashoffset='20'%3E%3CanimateTransform attributeName='transform' type='rotate' from='0 12 12' to='360 12 12' dur='0.8s' repeatCount='indefinite'/%3E%3C/circle%3E%3C/svg%3E") center no-repeat;
  }

  .or-divider {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
    opacity: 0;
    animation: fadeUp 0.6s ease 0.7s forwards;
  }

  .or-line { flex: 1; height: 1px; background: var(--border); }
  .or-text { font-size: 12px; color: var(--ink-faint); letter-spacing: 1px; }

  .social-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 36px;
    opacity: 0;
    animation: fadeUp 0.6s ease 0.75s forwards;
  }

  .social-btn {
    padding: 12px;
    background: var(--white);
    border: 1.5px solid var(--border);
    border-radius: 2px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: var(--ink);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: border-color 0.15s, background 0.15s;
  }

  .social-btn:hover { border-color: var(--ink); background: var(--cream); }

  .register-row {
    text-align: center;
    opacity: 0;
    animation: fadeUp 0.6s ease 0.8s forwards;
  }

  .register-text { font-size: 13px; color: var(--ink-soft); }

  .register-link {
    color: var(--ink);
    font-weight: 500;
    text-decoration: none;
    border-bottom: 1px solid var(--ink);
    padding-bottom: 1px;
    margin-left: 4px;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .register-link:hover { opacity: 0.6; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 768px) {
    .page { grid-template-columns: 1fr; }
    .left { display: none; }
    .right { padding: 40px 28px; }
  }
`;

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    // Simulate auth — replace this with your real auth call
    setTimeout(() => {
      if (onLogin) onLogin();
      setLoading(false);
      navigate("/");
    }, 1500);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="page">

        {/* ── LEFT PANEL ── */}
        <div className="left">
          <div className="left-logo">
            <div className="logo-icon"><span /><span /></div>
            <span className="logo-text">The Daily Post</span>
          </div>

          <div className="left-body">
            <p className="left-eyebrow">The Publication</p>
            <h1 className="left-headline">
              Ideas worth<br />
              <em>reading,</em><br />
              deeply.
            </h1>
            <p className="left-desc">
              Thoughtful essays, sharp analysis, and long-form writing
              for curious minds. No noise — just signal.
            </p>
          </div>

          <div className="left-footer">
            <div className="issue-tag">
              <span className="issue-dot" />
              <span className="issue-text">Vol. 04 · March 2026</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="right">
          <div className="form-wrap">

            <div className="form-header">
              <p className="form-eyebrow">Member access</p>
              <h2 className="form-title">Sign in</h2>
              <p className="form-subtitle">
                Welcome back. Enter your credentials<br />to access your reading list.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label className="field-label" htmlFor="email">Email</label>
                <div className="field-input-wrap">
                  <input
                    id="email"
                    className="field-input"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label className="field-label" htmlFor="password">Password</label>
                <div className="field-input-wrap">
                  <input
                    id="password"
                    className="field-input"
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ paddingRight: 56 }}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-pw"
                    onClick={() => setShowPw(v => !v)}
                  >
                    {showPw ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {error && (
                <p style={{ color: "#c0392b", fontSize: 13, marginBottom: 16, marginTop: -8 }}>
                  {error}
                </p>
              )}

              <div className="options-row">
                <label className="remember" onClick={() => setRemember(v => !v)}>
                  <div className={`remember-box ${remember ? "checked" : ""}`} />
                  <span className="remember-label">Remember me</span>
                </label>
                <a href="#" className="forgot-link">Forgot password?</a>
              </div>

              <button
                type="submit"
                className={`submit-btn ${loading ? "loading" : ""}`}
              >
                {loading ? "" : "Continue reading"}
              </button>
            </form>

            <div className="or-divider">
              <div className="or-line" />
              <span className="or-text">or</span>
              <div className="or-line" />
            </div>

            <div className="social-row">
              <button className="social-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button className="social-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
                GitHub
              </button>
            </div>

            <div className="register-row">
              <span className="register-text">
                New here?
                <span className="register-link" onClick={() => navigate("/signup")}>
                  Create an account
                </span>
              </span>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
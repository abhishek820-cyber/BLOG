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
    --error: #c0392b;
    --success: #27ae60;
  }

  .signup-page {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
    font-family: 'DM Sans', sans-serif;
    color: var(--ink);
  }

  /* ── LEFT PANEL ── */
  .signup-left {
    background: var(--ink);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 56px 64px;
    position: relative;
    overflow: hidden;
  }

  .signup-left::before {
    content: '';
    position: absolute;
    top: -100px; left: -100px;
    width: 420px; height: 420px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 70%);
    pointer-events: none;
  }

  .signup-left::after {
    content: '';
    position: absolute;
    bottom: -60px; right: -60px;
    width: 300px; height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%);
    pointer-events: none;
  }

  .signup-logo {
    display: flex;
    align-items: center;
    gap: 12px;
    opacity: 0;
    animation: fadeUp 0.6s ease 0.1s forwards;
  }

  .signup-logo-icon {
    width: 36px; height: 36px;
    position: relative;
  }

  .signup-logo-icon span {
    position: absolute;
    width: 18px; height: 18px;
    border: 2px solid var(--accent);
    border-radius: 3px;
  }

  .signup-logo-icon span:first-child { top: 0; left: 0; }
  .signup-logo-icon span:last-child {
    bottom: 0; right: 0;
    background: rgba(201,168,76,0.2);
  }

  .signup-logo-text {
    font-weight: 500;
    font-size: 15px;
    letter-spacing: 3px;
    color: var(--white);
    text-transform: uppercase;
  }

  .signup-left-body {
    opacity: 0;
    animation: fadeUp 0.7s ease 0.3s forwards;
  }

  .signup-left-eyebrow {
    font-size: 11px;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 24px;
  }

  .signup-left-headline {
    font-family: 'Playfair Display', serif;
    font-size: clamp(34px, 3.2vw, 48px);
    font-weight: 400;
    line-height: 1.18;
    color: var(--white);
    margin-bottom: 28px;
  }

  .signup-left-headline em {
    font-style: italic;
    color: var(--accent);
  }

  /* Perks list */
  .perks-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .perk-item {
    display: flex;
    align-items: flex-start;
    gap: 14px;
  }

  .perk-icon {
    width: 28px; height: 28px;
    border: 1px solid rgba(201,168,76,0.35);
    border-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .perk-icon svg { color: var(--accent); }

  .perk-text {
    font-size: 14px;
    line-height: 1.6;
    color: rgba(255,255,255,0.5);
  }

  .perk-text strong {
    display: block;
    color: rgba(255,255,255,0.85);
    font-weight: 500;
    margin-bottom: 2px;
  }

  .signup-left-footer {
    opacity: 0;
    animation: fadeUp 0.7s ease 0.5s forwards;
  }

  .readers-badge {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 2px;
  }

  .readers-avatars {
    display: flex;
  }

  .readers-avatars span {
    width: 24px; height: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(201,168,76,0.6), rgba(201,168,76,0.2));
    border: 1.5px solid var(--ink);
    margin-left: -6px;
    display: block;
  }

  .readers-avatars span:first-child { margin-left: 0; }

  .readers-text {
    font-size: 12px;
    color: rgba(255,255,255,0.35);
    letter-spacing: 0.5px;
  }

  /* ── RIGHT PANEL ── */
  .signup-right {
    background: var(--cream);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 64px;
    overflow-y: auto;
  }

  .signup-form-wrap {
    width: 100%;
    max-width: 400px;
    padding: 8px 0;
  }

  .signup-form-header {
    margin-bottom: 36px;
    opacity: 0;
    animation: fadeUp 0.6s ease 0.2s forwards;
  }

  .signup-eyebrow {
    font-size: 11px;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: var(--ink-faint);
    margin-bottom: 12px;
  }

  .signup-title {
    font-family: 'Playfair Display', serif;
    font-size: 32px;
    font-weight: 700;
    color: var(--ink);
    line-height: 1.2;
    margin-bottom: 8px;
  }

  .signup-subtitle {
    font-size: 14px;
    color: var(--ink-soft);
    line-height: 1.6;
  }

  /* Name row - two columns */
  .name-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  /* Fields */
  .sf {
    margin-bottom: 20px;
    opacity: 0;
    animation: fadeUp 0.5s ease forwards;
  }

  .sf:nth-child(1) { animation-delay: 0.30s; }
  .sf:nth-child(2) { animation-delay: 0.35s; }
  .sf:nth-child(3) { animation-delay: 0.40s; }
  .sf:nth-child(4) { animation-delay: 0.45s; }
  .sf:nth-child(5) { animation-delay: 0.50s; }

  .sf-label {
    display: block;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--ink-soft);
    margin-bottom: 8px;
  }

  .sf-input-wrap { position: relative; }

  .sf-input {
    width: 100%;
    padding: 13px 16px;
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

  .sf-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-light);
  }

  .sf-input.error {
    border-color: var(--error);
    box-shadow: 0 0 0 3px rgba(192,57,43,0.1);
  }

  .sf-input.valid {
    border-color: var(--success);
  }

  .sf-input::placeholder { color: var(--ink-faint); }

  .sf-input-padded { padding-right: 44px; }

  .sf-toggle {
    position: absolute;
    right: 14px; top: 50%;
    transform: translateY(-50%);
    background: none; border: none;
    cursor: pointer;
    color: var(--ink-faint);
    font-size: 12px;
    font-family: 'DM Sans', sans-serif;
    letter-spacing: 0.5px;
    padding: 4px;
    transition: color 0.15s;
  }

  .sf-toggle:hover { color: var(--ink); }

  .sf-error {
    margin-top: 5px;
    font-size: 12px;
    color: var(--error);
  }

  /* Password strength */
  .strength-bar {
    display: flex;
    gap: 4px;
    margin-top: 8px;
  }

  .strength-seg {
    flex: 1;
    height: 3px;
    border-radius: 2px;
    background: var(--border);
    transition: background 0.3s;
  }

  .strength-seg.weak   { background: #e74c3c; }
  .strength-seg.fair   { background: #f39c12; }
  .strength-seg.good   { background: #3498db; }
  .strength-seg.strong { background: var(--success); }

  .strength-label {
    margin-top: 4px;
    font-size: 11px;
    color: var(--ink-faint);
  }

  /* Terms */
  .terms-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 24px;
    opacity: 0;
    animation: fadeUp 0.5s ease 0.55s forwards;
  }

  .terms-box {
    width: 16px; height: 16px;
    min-width: 16px;
    border: 1.5px solid var(--border);
    border-radius: 2px;
    background: var(--white);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s;
    margin-top: 2px;
  }

  .terms-box.checked {
    background: var(--ink);
    border-color: var(--ink);
  }

  .terms-box.checked::after {
    content: '';
    width: 8px; height: 5px;
    border-left: 1.5px solid white;
    border-bottom: 1.5px solid white;
    transform: rotate(-45deg) translateY(-1px);
  }

  .terms-text {
    font-size: 13px;
    color: var(--ink-soft);
    line-height: 1.5;
    cursor: pointer;
    user-select: none;
  }

  .terms-text a {
    color: var(--ink);
    border-bottom: 1px solid var(--ink);
    text-decoration: none;
    transition: opacity 0.15s;
  }

  .terms-text a:hover { opacity: 0.6; }

  /* Submit */
  .signup-btn {
    width: 100%;
    padding: 15px;
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
    animation: fadeUp 0.5s ease 0.6s forwards;
    position: relative;
    overflow: hidden;
  }

  .signup-btn:hover:not(:disabled) { background: #2d2a26; }
  .signup-btn:active:not(:disabled) { transform: scale(0.99); }
  .signup-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .signup-btn.loading {
    pointer-events: none;
    color: transparent;
  }

  .signup-btn.loading::after {
    content: '';
    position: absolute;
    inset: 0;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='20' height='20'%3E%3Ccircle cx='12' cy='12' r='10' fill='none' stroke='white' stroke-width='2' stroke-dasharray='40' stroke-dashoffset='20'%3E%3CanimateTransform attributeName='transform' type='rotate' from='0 12 12' to='360 12 12' dur='0.8s' repeatCount='indefinite'/%3E%3C/circle%3E%3C/svg%3E") center no-repeat;
  }

  /* Divider */
  .signup-divider {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 18px;
    opacity: 0;
    animation: fadeUp 0.5s ease 0.65s forwards;
  }

  .signup-divider-line { flex: 1; height: 1px; background: var(--border); }
  .signup-divider-text { font-size: 12px; color: var(--ink-faint); }

  /* Social */
  .signup-social {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 32px;
    opacity: 0;
    animation: fadeUp 0.5s ease 0.7s forwards;
  }

  .signup-social-btn {
    padding: 11px;
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

  .signup-social-btn:hover { border-color: var(--ink); background: var(--cream); }

  /* Login link */
  .login-row {
    text-align: center;
    opacity: 0;
    animation: fadeUp 0.5s ease 0.75s forwards;
  }

  .login-row-text { font-size: 13px; color: var(--ink-soft); }

  .login-row-link {
    color: var(--ink);
    font-weight: 500;
    text-decoration: none;
    border-bottom: 1px solid var(--ink);
    padding-bottom: 1px;
    margin-left: 4px;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .login-row-link:hover { opacity: 0.6; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 768px) {
    .signup-page { grid-template-columns: 1fr; }
    .signup-left { display: none; }
    .signup-right { padding: 40px 28px; }
    .name-row { grid-template-columns: 1fr; gap: 0; }
  }
`;

function getStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
const strengthClasses = ["", "weak", "fair", "good", "strong"];

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "", confirmPassword: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required";
    if (!form.lastName.trim()) errs.lastName = "Last name is required";
    if (!form.email.includes("@")) errs.email = "Enter a valid email address";
    if (form.password.length < 8) errs.password = "Password must be at least 8 characters";
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match";
    if (!agreed) errs.terms = "You must agree to the terms";
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/login");
    }, 2000);
  };

  const strength = getStrength(form.password);

  return (
    <>
      <style>{styles}</style>
      <div className="signup-page">

        {/* ── LEFT ── */}
        <div className="signup-left">
          <div className="signup-logo">
            <div className="signup-logo-icon"><span /><span /></div>
            <span className="signup-logo-text">The Daily Post</span>
          </div>

          <div className="signup-left-body">
            <p className="signup-left-eyebrow">Join the community</p>
            <h1 className="signup-left-headline">
              Start your<br />
              <em>writing</em><br />
              journey today.
            </h1>
            <ul className="perks-list">
              {[
                ["Unlimited Reading", "Access every article, essay, and deep-dive in our archive."],
                ["Publish Your Work", "Write, edit, and share your stories with our readers."],
                ["Curated Digest", "Weekly picks delivered to your inbox. No noise."],
              ].map(([title, desc]) => (
                <li key={title} className="perk-item">
                  <div className="perk-icon">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="2,6 5,9 10,3" />
                    </svg>
                  </div>
                  <div className="perk-text">
                    <strong>{title}</strong>
                    {desc}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="signup-left-footer">
            <div className="readers-badge">
              <div className="readers-avatars">
                <span /><span /><span /><span />
              </div>
              <span className="readers-text">12,400+ readers already joined</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="signup-right">
          <div className="signup-form-wrap">

            <div className="signup-form-header">
              <p className="signup-eyebrow">New member</p>
              <h2 className="signup-title">Create account</h2>
              <p className="signup-subtitle">Free forever. No credit card required.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>

              {/* Name row */}
              <div className="name-row">
                <div className="sf">
                  <label className="sf-label">First name</label>
                  <input
                    className={`sf-input ${errors.firstName ? "error" : form.firstName ? "valid" : ""}`}
                    type="text" placeholder="Jane"
                    value={form.firstName} onChange={set("firstName")}
                  />
                  {errors.firstName && <p className="sf-error">{errors.firstName}</p>}
                </div>
                <div className="sf">
                  <label className="sf-label">Last name</label>
                  <input
                    className={`sf-input ${errors.lastName ? "error" : form.lastName ? "valid" : ""}`}
                    type="text" placeholder="Smith"
                    value={form.lastName} onChange={set("lastName")}
                  />
                  {errors.lastName && <p className="sf-error">{errors.lastName}</p>}
                </div>
              </div>

              {/* Email */}
              <div className="sf">
                <label className="sf-label">Email address</label>
                <input
                  className={`sf-input ${errors.email ? "error" : form.email.includes("@") ? "valid" : ""}`}
                  type="email" placeholder="you@example.com"
                  value={form.email} onChange={set("email")}
                />
                {errors.email && <p className="sf-error">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="sf">
                <label className="sf-label">Password</label>
                <div className="sf-input-wrap">
                  <input
                    className={`sf-input sf-input-padded ${errors.password ? "error" : ""}`}
                    type={showPw ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={form.password} onChange={set("password")}
                  />
                  <button type="button" className="sf-toggle" onClick={() => setShowPw(v => !v)}>
                    {showPw ? "Hide" : "Show"}
                  </button>
                </div>
                {form.password && (
                  <>
                    <div className="strength-bar">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`strength-seg ${i <= strength ? strengthClasses[strength] : ""}`} />
                      ))}
                    </div>
                    <p className="strength-label">{strengthLabels[strength]} password</p>
                  </>
                )}
                {errors.password && <p className="sf-error">{errors.password}</p>}
              </div>

              {/* Confirm password */}
              <div className="sf">
                <label className="sf-label">Confirm password</label>
                <div className="sf-input-wrap">
                  <input
                    className={`sf-input sf-input-padded ${errors.confirmPassword ? "error" : form.confirmPassword && form.confirmPassword === form.password ? "valid" : ""}`}
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat your password"
                    value={form.confirmPassword} onChange={set("confirmPassword")}
                  />
                  <button type="button" className="sf-toggle" onClick={() => setShowConfirm(v => !v)}>
                    {showConfirm ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.confirmPassword && <p className="sf-error">{errors.confirmPassword}</p>}
              </div>

              {/* Terms */}
              <div className="terms-row">
                <div
                  className={`terms-box ${agreed ? "checked" : ""}`}
                  onClick={() => setAgreed(v => !v)}
                />
                <p className="terms-text" onClick={() => setAgreed(v => !v)}>
                  I agree to the <a href="#" onClick={e => e.stopPropagation()}>Terms of Service</a> and{" "}
                  <a href="#" onClick={e => e.stopPropagation()}>Privacy Policy</a>
                </p>
              </div>
              {errors.terms && <p className="sf-error" style={{ marginTop: -16, marginBottom: 16 }}>{errors.terms}</p>}

              <button
                type="submit"
                className={`signup-btn ${loading ? "loading" : ""}`}
                disabled={loading}
              >
                {loading ? "" : "Create my account"}
              </button>
            </form>

            <div className="signup-divider">
              <div className="signup-divider-line" />
              <span className="signup-divider-text">or</span>
              <div className="signup-divider-line" />
            </div>

            <div className="signup-social">
              <button className="signup-social-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button className="signup-social-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
                GitHub
              </button>
            </div>

            <div className="login-row">
              <span className="login-row-text">
                Already have an account?
                <span className="login-row-link" onClick={() => navigate("/login")}>Sign in</span>
              </span>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
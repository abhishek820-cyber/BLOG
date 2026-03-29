import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "https://blog-2hg9.onrender.com";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --cream: #faf8f5; --ink: #1a1814; --ink-soft: #6b6660;
    --ink-faint: #b8b3ae; --accent: #c9a84c; --accent-light: #f0e6cc;
    --border: #e8e3dc; --white: #ffffff; --error: #c0392b; --success: #27ae60;
  }
  body { background: var(--cream); font-family: 'DM Sans', sans-serif; color: var(--ink); min-height: 100vh; }
  .signup-page { min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; }
  .signup-left { background: var(--ink); display: flex; flex-direction: column; justify-content: space-between; padding: 56px 64px; position: relative; overflow: hidden; }
  .signup-left::before { content: ''; position: absolute; top: -100px; left: -100px; width: 420px; height: 420px; border-radius: 50%; background: radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 70%); pointer-events: none; }
  .signup-left::after { content: ''; position: absolute; bottom: -60px; right: -60px; width: 300px; height: 300px; border-radius: 50%; background: radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%); pointer-events: none; }
  .signup-logo { display: flex; align-items: center; gap: 12px; opacity: 0; animation: fadeUp 0.6s ease 0.1s forwards; }
  .signup-logo-icon { width: 36px; height: 36px; position: relative; }
  .signup-logo-icon span { position: absolute; width: 18px; height: 18px; border: 2px solid var(--accent); border-radius: 3px; }
  .signup-logo-icon span:first-child { top: 0; left: 0; }
  .signup-logo-icon span:last-child { bottom: 0; right: 0; background: rgba(201,168,76,0.2); }
  .signup-logo-text { font-weight: 500; font-size: 15px; letter-spacing: 3px; color: var(--white); text-transform: uppercase; }
  .signup-left-body { opacity: 0; animation: fadeUp 0.7s ease 0.3s forwards; }
  .signup-left-eyebrow { font-size: 11px; letter-spacing: 4px; text-transform: uppercase; color: var(--accent); margin-bottom: 24px; }
  .signup-left-headline { font-family: 'Playfair Display', serif; font-size: clamp(34px, 3.2vw, 48px); font-weight: 400; line-height: 1.18; color: var(--white); margin-bottom: 28px; }
  .signup-left-headline em { font-style: italic; color: var(--accent); }
  .perks-list { list-style: none; display: flex; flex-direction: column; gap: 16px; }
  .perk-item { display: flex; align-items: flex-start; gap: 14px; }
  .perk-icon { width: 28px; height: 28px; border: 1px solid rgba(201,168,76,0.35); border-radius: 2px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
  .perk-text { font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.5); }
  .perk-text strong { display: block; color: rgba(255,255,255,0.85); font-weight: 500; margin-bottom: 2px; }
  .signup-left-footer { opacity: 0; animation: fadeUp 0.7s ease 0.5s forwards; }
  .readers-badge { display: inline-flex; align-items: center; gap: 12px; padding: 12px 16px; border: 1px solid rgba(255,255,255,0.08); border-radius: 2px; }
  .readers-avatars { display: flex; }
  .readers-avatars span { width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg, rgba(201,168,76,0.6), rgba(201,168,76,0.2)); border: 1.5px solid var(--ink); margin-left: -6px; display: block; }
  .readers-avatars span:first-child { margin-left: 0; }
  .readers-text { font-size: 12px; color: rgba(255,255,255,0.35); letter-spacing: 0.5px; }
  .signup-right { background: var(--cream); display: flex; align-items: center; justify-content: center; padding: 48px 64px; overflow-y: auto; }
  .signup-form-wrap { width: 100%; max-width: 400px; padding: 8px 0; }
  .signup-form-header { margin-bottom: 36px; opacity: 0; animation: fadeUp 0.6s ease 0.2s forwards; }
  .signup-eyebrow { font-size: 11px; letter-spacing: 4px; text-transform: uppercase; color: var(--ink-faint); margin-bottom: 12px; }
  .signup-title { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; color: var(--ink); line-height: 1.2; margin-bottom: 8px; }
  .signup-subtitle { font-size: 14px; color: var(--ink-soft); line-height: 1.6; }
  .sf { margin-bottom: 20px; opacity: 0; animation: fadeUp 0.5s ease forwards; }
  .sf:nth-child(1) { animation-delay: 0.30s; }
  .sf:nth-child(2) { animation-delay: 0.38s; }
  .sf:nth-child(3) { animation-delay: 0.46s; }
  .sf-label { display: block; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: var(--ink-soft); margin-bottom: 8px; }
  .sf-input-wrap { position: relative; }
  .sf-input { width: 100%; padding: 13px 16px; font-family: 'DM Sans', sans-serif; font-size: 15px; color: var(--ink); background: var(--white); border: 1.5px solid var(--border); border-radius: 2px; outline: none; transition: border-color 0.2s, box-shadow 0.2s; appearance: none; }
  .sf-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-light); }
  .sf-input.error { border-color: var(--error); box-shadow: 0 0 0 3px rgba(192,57,43,0.1); }
  .sf-input.valid { border-color: var(--success); }
  .sf-input::placeholder { color: var(--ink-faint); }
  .sf-input-padded { padding-right: 44px; }
  .sf-toggle { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--ink-faint); font-size: 12px; font-family: 'DM Sans', sans-serif; padding: 4px; transition: color 0.15s; }
  .sf-toggle:hover { color: var(--ink); }
  .sf-error { margin-top: 5px; font-size: 12px; color: var(--error); }
  .strength-bar { display: flex; gap: 4px; margin-top: 8px; }
  .strength-seg { flex: 1; height: 3px; border-radius: 2px; background: var(--border); transition: background 0.3s; }
  .strength-seg.weak { background: #e74c3c; } .strength-seg.fair { background: #f39c12; }
  .strength-seg.good { background: #3498db; } .strength-seg.strong { background: var(--success); }
  .strength-label { margin-top: 4px; font-size: 11px; color: var(--ink-faint); }
  .error-banner { background: rgba(192,57,43,0.06); border: 1.5px solid rgba(192,57,43,0.25); border-radius: 2px; padding: 12px 16px; margin-bottom: 20px; font-size: 13px; color: var(--error); line-height: 1.5; }
  .signup-btn { width: 100%; padding: 15px; background: var(--ink); color: var(--white); border: none; border-radius: 2px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; cursor: pointer; transition: background 0.2s, transform 0.1s; margin-bottom: 20px; opacity: 0; animation: fadeUp 0.5s ease 0.52s forwards; position: relative; overflow: hidden; }
  .signup-btn:hover:not(:disabled) { background: #2d2a26; }
  .signup-btn:active:not(:disabled) { transform: scale(0.99); }
  .signup-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .signup-btn.loading { pointer-events: none; color: transparent; }
  .signup-btn.loading::after { content: ''; position: absolute; inset: 0; background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='20' height='20'%3E%3Ccircle cx='12' cy='12' r='10' fill='none' stroke='white' stroke-width='2' stroke-dasharray='40' stroke-dashoffset='20'%3E%3CanimateTransform attributeName='transform' type='rotate' from='0 12 12' to='360 12 12' dur='0.8s' repeatCount='indefinite'/%3E%3C/circle%3E%3C/svg%3E") center no-repeat; }
  .login-row { text-align: center; opacity: 0; animation: fadeUp 0.5s ease 0.58s forwards; }
  .login-row-text { font-size: 13px; color: var(--ink-soft); }
  .login-row-link { color: var(--ink); font-weight: 500; border-bottom: 1px solid var(--ink); padding-bottom: 1px; margin-left: 4px; cursor: pointer; transition: opacity 0.15s; }
  .login-row-link:hover { opacity: 0.6; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @media (max-width: 768px) { .signup-page { grid-template-columns: 1fr; } .signup-left { display: none; } .signup-right { padding: 40px 28px; } }
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
  const [form, setForm] = useState({ username: "", password: "", confirmPassword: "" });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.username.trim()) errs.username = "Username is required";
    if (form.password.length < 8) errs.password = "Password must be at least 8 characters";
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setApiError("");
    setLoading(true);
    try {
      await axios.post(`${API}/api/register/`, {
        username: form.username,
        password: form.password,
      });
      // Account created — go straight to login
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      console.error("Register error:", err.response?.status, err.response?.data);
      const data = err.response?.data;
      if (data?.username) {
        setApiError(data.username[0]);
      } else if (data?.password) {
        setApiError(data.password[0]);
      } else if (data?.message) {
        setApiError(data.message);
      } else {
        setApiError(`Error ${err.response?.status || "—"}: Could not create account. Try again.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const strength = getStrength(form.password);

  return (
    <>
      <style>{styles}</style>
      <div className="signup-page">

        {/* LEFT */}
        <div className="signup-left">
          <div className="signup-logo">
            <div className="signup-logo-icon"><span /><span /></div>
            <span className="signup-logo-text">The Daily Post</span>
          </div>
          <div className="signup-left-body">
            <p className="signup-left-eyebrow">Join the community</p>
            <h1 className="signup-left-headline">Start your<br /><em>writing</em><br />journey today.</h1>
            <ul className="perks-list">
              {[["Unlimited Reading", "Access every article in our archive."],
                ["Publish Your Work", "Write and share your stories."],
                ["Your posts, always saved", "Everything you write is stored in our database."]
              ].map(([t, d]) => (
                <li key={t} className="perk-item">
                  <div className="perk-icon">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#c9a84c" strokeWidth="2">
                      <polyline points="2,6 5,9 10,3" />
                    </svg>
                  </div>
                  <div className="perk-text"><strong>{t}</strong>{d}</div>
                </li>
              ))}
            </ul>
          </div>
          <div className="signup-left-footer">
            <div className="readers-badge">
              <div className="readers-avatars"><span /><span /><span /><span /></div>
              <span className="readers-text">12,400+ readers already joined</span>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="signup-right">
          <div className="signup-form-wrap">
            <div className="signup-form-header">
              <p className="signup-eyebrow">New member</p>
              <h2 className="signup-title">Create account</h2>
              <p className="signup-subtitle">Free forever. No email required.</p>
            </div>

            {apiError && <div className="error-banner">{apiError}</div>}

            <form onSubmit={handleSubmit} noValidate>

              <div className="sf">
                <label className="sf-label">Username</label>
                <input
                  className={`sf-input ${errors.username ? "error" : form.username ? "valid" : ""}`}
                  type="text" placeholder="johndoe"
                  value={form.username} onChange={set("username")}
                />
                {errors.username && <p className="sf-error">{errors.username}</p>}
              </div>

              <div className="sf">
                <label className="sf-label">Password</label>
                <div className="sf-input-wrap">
                  <input
                    className={`sf-input sf-input-padded ${errors.password ? "error" : ""}`}
                    type={showPw ? "text" : "password"} placeholder="Min. 8 characters"
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

              <div className="sf">
                <label className="sf-label">Confirm password</label>
                <div className="sf-input-wrap">
                  <input
                    className={`sf-input sf-input-padded ${errors.confirmPassword ? "error" : form.confirmPassword && form.confirmPassword === form.password ? "valid" : ""}`}
                    type={showConfirm ? "text" : "password"} placeholder="Repeat your password"
                    value={form.confirmPassword} onChange={set("confirmPassword")}
                  />
                  <button type="button" className="sf-toggle" onClick={() => setShowConfirm(v => !v)}>
                    {showConfirm ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.confirmPassword && <p className="sf-error">{errors.confirmPassword}</p>}
              </div>

              <button type="submit" className={`signup-btn ${loading ? "loading" : ""}`} disabled={loading}>
                {loading ? "" : "Create my account"}
              </button>
            </form>

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
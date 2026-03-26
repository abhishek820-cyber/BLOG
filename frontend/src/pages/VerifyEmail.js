import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --cream: #faf8f5; --ink: #1a1814; --ink-soft: #6b6660;
    --ink-faint: #b8b3ae; --accent: #c9a84c; --border: #e8e3dc;
    --white: #ffffff; --error: #c0392b; --success: #27ae60;
  }
  body { background: var(--cream); font-family: 'DM Sans', sans-serif; }

  .verify-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--cream);
    padding: 40px 24px;
  }

  .verify-card {
    width: 100%;
    max-width: 440px;
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 56px 48px;
    text-align: center;
    opacity: 0;
    animation: fadeUp 0.5s ease 0.1s forwards;
  }

  .verify-icon {
    width: 64px; height: 64px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 28px;
    font-size: 28px;
  }

  .verify-icon.loading { background: rgba(201,168,76,0.12); }
  .verify-icon.success { background: rgba(39,174,96,0.12); }
  .verify-icon.error   { background: rgba(192,57,43,0.1); }

  .verify-eyebrow {
    font-size: 11px; letter-spacing: 4px; text-transform: uppercase;
    color: var(--ink-faint); margin-bottom: 12px;
  }

  .verify-title {
    font-family: 'Playfair Display', serif;
    font-size: 28px; font-weight: 700;
    color: var(--ink); margin-bottom: 12px; line-height: 1.2;
  }

  .verify-msg {
    font-size: 15px; color: var(--ink-soft);
    line-height: 1.6; margin-bottom: 32px;
  }

  .verify-btn {
    display: inline-block;
    padding: 13px 32px;
    background: var(--ink); color: var(--white);
    border: none; border-radius: 2px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; font-weight: 500;
    letter-spacing: 3px; text-transform: uppercase;
    cursor: pointer; transition: background 0.2s;
    text-decoration: none;
  }

  .verify-btn:hover { background: #2d2a26; }

  .verify-btn.outline {
    background: transparent;
    border: 1.5px solid var(--border);
    color: var(--ink-soft);
    margin-left: 12px;
  }

  .verify-btn.outline:hover { border-color: var(--ink); color: var(--ink); }

  .spinner {
    width: 32px; height: 32px;
    border: 3px solid var(--accent-light, #f0e6cc);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("No verification token found in the link. Please check your email.");
      return;
    }

    axios
      .get(`${process.env.REACT_APP_API_URL}/api/verify-email/?token=${token}`)
      .then((res) => {
        setStatus("success");
        setMessage(res.data.message || "Your email has been verified!");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(
          err.response?.data?.error ||
          "This link is invalid or has already been used."
        );
      });
  }, []);

  const icons = {
    loading: <div className="spinner" />,
    success: "✓",
    error:   "✕",
  };

  const titles = {
    loading: "Verifying your email…",
    success: "Email verified!",
    error:   "Verification failed",
  };

  return (
    <>
      <style>{styles}</style>
      <div className="verify-page">
        <div className="verify-card">

          <div className={`verify-icon ${status}`}>
            {icons[status]}
          </div>

          <p className="verify-eyebrow">The Daily Post</p>
          <h1 className="verify-title">{titles[status]}</h1>
          <p className="verify-msg">{message || "Please wait…"}</p>

          {status === "success" && (
            <button className="verify-btn" onClick={() => navigate("/login")}>
              Go to login
            </button>
          )}

          {status === "error" && (
            <>
              <button className="verify-btn" onClick={() => navigate("/signup")}>
                Sign up again
              </button>
              <button
                className="verify-btn outline"
                onClick={() => navigate("/resend-verification")}
              >
                Resend link
              </button>
            </>
          )}

        </div>
      </div>
    </>
  );
}
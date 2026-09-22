import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%)",
    }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        {/* Card */}
        <div style={{
          background: "#ffffff",
          borderRadius: "24px",
          boxShadow: "0 20px 60px rgba(3, 105, 161, 0.12), 0 4px 16px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}>
          {/* Card top accent bar */}
          <div style={{
            height: "5px",
            background: "linear-gradient(90deg, #0369a1, #0ea5e9, #06b6d4)",
          }} />

          <div style={{ padding: "36px 32px 32px" }}>
            {/* Header */}
            <div style={{ marginBottom: "28px" }}>
              <h1 style={{
                fontSize: "26px",
                fontWeight: 600,
                color: "#0c1a2e",
                letterSpacing: "-0.025em",
                margin: 0,
                lineHeight: 1.2,
              }}>
                Welcome back
              </h1>
              <p style={{
                marginTop: "6px",
                color: "#64748b",
                fontSize: "14px",
                fontWeight: 400,
              }}>
                Sign in to manage your reports.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: "#fef2f2",
                border: "1.5px solid #fecaca",
                color: "#b91c1c",
                borderRadius: "12px",
                padding: "12px 14px",
                fontSize: "13px",
                fontWeight: 600,
                marginBottom: "20px",
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
              }}>
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "18px" }}>
              {/* Email */}
              <div>
                <label style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "#475569",
                  textTransform: "uppercase",
                  letterSpacing: "0.09em",
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  style={{
                    width: "100%",
                    padding: "13px 16px",
                    borderRadius: "12px",
                    border: "1.5px solid #e2e8f0",
                    background: "#f8fafc",
                    color: "#0f172a",
                    fontSize: "14px",
                    fontWeight: 500,
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.15s",
                  }}
                  onFocus={e => e.target.style.borderColor = "#0ea5e9"}
                  onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                />
              </div>

              {/* Password */}
              <div>
                <label style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "#475569",
                  textTransform: "uppercase",
                  letterSpacing: "0.09em",
                }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{
                      width: "100%",
                      padding: "13px 46px 13px 16px",
                      borderRadius: "12px",
                      border: "1.5px solid #e2e8f0",
                      background: "#f8fafc",
                      color: "#0f172a",
                      fontSize: "14px",
                      fontWeight: 500,
                      outline: "none",
                      boxSizing: "border-box",
                      transition: "border-color 0.15s",
                    }}
                    onFocus={e => e.target.style.borderColor = "#0ea5e9"}
                    onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    style={{
                      position: "absolute",
                      right: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#94a3b8",
                      fontSize: "16px",
                      padding: 0,
                    }}
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "12px",
                  border: "none",
                  background: loading
                    ? "#7dd3fc"
                    : "linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%)",
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: loading ? "none" : "0 6px 20px rgba(14,165,233,0.32)",
                  transition: "all 0.18s",
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                {loading ? "Signing in…" : "Sign In →"}
              </button>
            </form>

            {/* Footer link */}
            <div style={{ marginTop: "20px", textAlign: "center", fontSize: "13px", color: "#64748b", fontWeight: 500 }}>
              Don't have an account?{" "}
              <Link
                to="/signup"
                style={{ color: "#0369a1", fontWeight: 600, textDecoration: "none" }}
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "16px", textAlign: "center", color: "#94a3b8", fontSize: "11px", fontWeight: 400, letterSpacing: "0.06em" }}>
          PUREOCEAN · SECURE LOGIN
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api.js";

export default function SignupPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("general");
  const [bio, setBio] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);
    try {
      await api.post("/api/auth/signup", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        role,
        bio: bio.trim(),
        password,
      });

      setSuccessMsg("Account created successfully. Please log in.");
      setTimeout(() => navigate("/login", { replace: true }), 800);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1.5px solid #e2e8f0",
    background: "#f8fafc",
    color: "#0f172a",
    fontSize: "14px",
    fontWeight: 400,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "6px",
    fontSize: "11px",
    fontWeight: 500,
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.09em",
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "28px 24px",
      background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%)",
    }}>
      <div style={{ width: "100%", maxWidth: "640px" }}>
        {/* Card */}
        <div style={{
          background: "#ffffff",
          borderRadius: "24px",
          boxShadow: "0 20px 60px rgba(3, 105, 161, 0.12), 0 4px 16px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}>
          {/* Top accent bar */}
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
                Create your account
              </h1>
              <p style={{
                marginTop: "6px",
                color: "#64748b",
                fontSize: "14px",
                fontWeight: 400,
              }}>
                Join and report pollution sightings.
              </p>
            </div>

            {/* Alerts */}
            {error && (
              <div style={{
                background: "#fef2f2",
                border: "1.5px solid #fecaca",
                color: "#b91c1c",
                borderRadius: "12px",
                padding: "12px 14px",
                fontSize: "13px",
                fontWeight: 400,
                marginBottom: "20px",
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
              }}>
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div style={{
                background: "#f0fdf4",
                border: "1.5px solid #bbf7d0",
                color: "#15803d",
                borderRadius: "12px",
                padding: "12px 14px",
                fontSize: "13px",
                fontWeight: 400,
                marginBottom: "20px",
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
              }}>
                <span>✅</span>
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "18px" }}>

              {/* Name + Phone */}
              <div style={{ display: "grid", gap: "18px", gridTemplateColumns: "1fr 1fr" }}>
                <div>
                  <label style={labelStyle}>Name</label>
                  <input
                    style={inputStyle}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    required
                    onFocus={e => e.target.style.borderColor = "#0ea5e9"}
                    onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input
                    style={inputStyle}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 234 567 890"
                    required
                    onFocus={e => e.target.style.borderColor = "#0ea5e9"}
                    onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={labelStyle}>Email Address</label>
                <input
                  style={inputStyle}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  onFocus={e => e.target.style.borderColor = "#0ea5e9"}
                  onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                />
              </div>

              {/* Role + Password */}
              <div style={{ display: "grid", gap: "18px", gridTemplateColumns: "1fr 1fr" }}>
                <div>
                  <label style={labelStyle}>Role</label>
                  <select
                    style={{
                      ...inputStyle,
                      cursor: "pointer",
                      appearance: "auto",
                    }}
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    onFocus={e => e.target.style.borderColor = "#0ea5e9"}
                    onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                  >
                    <option value="general">General User</option>
                    <option value="volunteer">Volunteer</option>
                  </select>
                  <p style={{ marginTop: "6px", color: "#94a3b8", fontSize: "11px", fontWeight: 400 }}>
                    Volunteer features added later.
                  </p>
                </div>

                <div>
                  <label style={labelStyle}>Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      style={{ ...inputStyle, paddingRight: "44px" }}
                      type={showPassword ? "text" : "password"}
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      onFocus={e => e.target.style.borderColor = "#0ea5e9"}
                      onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#94a3b8",
                        fontSize: "15px",
                        padding: 0,
                      }}
                    >
                      {showPassword ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label style={labelStyle}>Bio <span style={{ fontWeight: 500, textTransform: "none", letterSpacing: 0, color: "#94a3b8" }}>(optional)</span></label>
                <textarea
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    minHeight: "100px",
                    lineHeight: 1.6,
                  }}
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us a bit about yourself…"
                  onFocus={e => e.target.style.borderColor = "#0ea5e9"}
                  onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                />
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
                {loading ? "Creating Account…" : "Create Account →"}
              </button>
            </form>

            {/* Footer link */}
            <div style={{ marginTop: "20px", textAlign: "center", fontSize: "13px", color: "#64748b", fontWeight: 400 }}>
              Already have an account?{" "}
              <Link
                to="/login"
                style={{ color: "#0369a1", fontWeight: 600, textDecoration: "none" }}
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "16px", textAlign: "center", color: "#94a3b8", fontSize: "11px", fontWeight: 400, letterSpacing: "0.06em" }}>
          PUREOCEAN · CREATE YOUR ACCOUNT
        </div>
      </div>
    </div>
  );
}
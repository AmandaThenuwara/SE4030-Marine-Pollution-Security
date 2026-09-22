import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import pureOceanLogo from "../assets/img/pureocean.png";

function TopNavLink({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        isActive ? "mp-btn mp-btn-primary" : "mp-btn mp-btn-secondary"
      }
      style={{ padding: "8px 12px", borderRadius: 12, fontSize: 13 }}
    >
      {label}
    </NavLink>
  );
}

export default function AppShell({ title, subtitle, rightActions, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div>
      <div className="mp-container">
        {/* Page header - Redesigned with Navy Theme */}
        <div style={{
          background: 'linear-gradient(155deg, #0a1628 0%, #0f2444 35%, #162d4a 70%, #1a3a5c 100%)',
          borderRadius: '1.5rem',
          padding: '2.5rem',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '18px',
          border: '1px solid rgba(255,255,255,0.05)',
        }}>
          {/* Subtle glowing accents */}
          <div style={{
            position: 'absolute', top: '-10%', right: '-5%',
            width: '240px', height: '240px', borderRadius: '50%',
            background: 'rgba(56, 189, 248, 0.05)', filter: 'blur(50px)',
          }} />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
              position: 'relative',
              zIndex: 2,
            }}
          >
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ 
                width: 54, 
                height: 54, 
                borderRadius: 14, 
                backgroundColor: "rgba(255,255,255,0.05)", 
                border: "1px solid rgba(255,255,255,0.1)", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                overflow: "hidden" 
              }}>
                <img src={pureOceanLogo} alt="Pure Ocean" style={{ width: "80%", height: "80%", objectFit: "contain" }} />
              </div>
              <div>
                <h1 className="mp-title" style={{ color: 'white', margin: 0 }}>{title}</h1>
                {subtitle && <p className="mp-subtitle" style={{ color: '#94a3b8', marginTop: 4 }}>{subtitle}</p>}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {rightActions}
            </div>
          </div>
        </div>

        {/* Page content */}
        <div style={{ marginTop: 18 }}>{children}</div>
      </div>
    </div>
  );
}
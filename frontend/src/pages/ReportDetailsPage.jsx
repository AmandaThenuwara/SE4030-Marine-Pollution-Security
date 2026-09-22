import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/api.js";
import AppShell from "../components/AppShell.jsx";
import { useAuth } from "../context/AuthContext";
import { MapContainer, TileLayer, Marker } from "react-leaflet";

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function ReportDetailsPage() {
  const { isAdmin } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    loadReport();
  }, [id]);

  async function loadReport() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/ch/reports/${id}`);
      setReport(res.data.report || null);
    } catch (err) {
      setError("Failed to load report data.");
    } finally {
      setLoading(false);
    }
  }

  async function generateAI() {
    setError("");
    setNotice("");
    try {
      const res = await api.post(`/ch/reports/${id}/ai/generate`, { force: true });
      setReport(res.data.report);
      setNotice("AI Analysis updated successfully.");
    } catch (err) {
      setError(err?.response?.data?.message || "AI Analysis failed.");
    }
  }

  async function publishReport() {
    setError("");
    setNotice("");
    try {
      const res = await api.post(`/ch/reports/${id}/publish`);
      setReport(res.data.report);
      setNotice("Report published successfully.");
    } catch (err) {
      setError("Failed to publish report.");
    }
  }

  async function deleteReport() {
    if (!window.confirm("Delete this report permanently?")) return;
    try {
      await api.delete(`/ch/reports/${id}`);
      navigate("/reports-dashboard");
    } catch (err) {
      setError("Failed to delete report.");
    }
  }

  const isDark = isAdmin();

  if (loading) {
    return (
      <div className={isDark ? "dark min-h-screen bg-[#020617]" : "min-h-screen bg-slate-50"}>
        <AppShell title="Loading..." subtitle="Fetching report details.">
          <div className="mp-card">
            <div className="mp-card-inner">Please wait...</div>
          </div>
        </AppShell>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className={isDark ? "dark min-h-screen bg-[#020617]" : "min-h-screen bg-slate-50"}>
        <AppShell title="Error" subtitle="Something went wrong.">
          <div className="mp-alert-error">{error || "Report not found."}</div>
          <div style={{ marginTop: 14 }}>
            <Link to="/reports-dashboard" className="mp-btn mp-btn-secondary">
              ← Back to Dashboard
            </Link>
          </div>
        </AppShell>
      </div>
    );
  }

  const r = report;

  return (
    <div className={isDark ? "dark min-h-screen bg-[#020617]" : "min-h-screen bg-slate-50"}>
      <AppShell
        title={r.title}
        subtitle={`Report ID: ${r._id}`}
        rightActions={
          <div style={{ display: "flex", gap: 10 }}>
            {r.isPublished ? (
              <span className="mp-chip" style={{ background: "#22c55e", color: "#fff", border: "none" }}>
                Published
              </span>
            ) : (
              <span className="mp-chip" style={{ background: "#f59e0b", color: "#fff", border: "none" }}>
                Draft
              </span>
            )}
            <Link to="/reports-dashboard" className="mp-btn mp-btn-secondary">
              Dashboard
            </Link>
          </div>
        }
      >
        {notice ? <div className="mp-alert-success" style={{ marginBottom: 14 }}>{notice}</div> : null}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 20 }}>
          {/* Main Content */}
          <div style={{ display: "grid", gap: 20 }}>
            <div className="mp-card">
              <div className="mp-card-inner">
                <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid var(--border-mp)" }}>
                  <div style={{ aspectRatio: "16/9", background: "var(--bg-2)" }}>
                    {r.photoUrl ? (
                      <img src={r.photoUrl} alt={r.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : null}
                  </div>
                </div>

                <div style={{ marginTop: 20 }}>
                  <div className="mp-label">Description</div>
                  <div style={{ fontSize: 16, lineHeight: 1.6, color: "var(--text-mp)", whiteSpace: "pre-wrap" }}>
                    {r.finalDescription || "No description provided."}
                  </div>
                </div>

                <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <span className="mp-chip">Severity: {r.severity}</span>
                  <span className="mp-chip">Created: {formatDate(r.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="mp-card">
              <div className="mp-card-inner">
                <div className="mp-title" style={{ fontSize: 18 }}>AI Analysis</div>
                <div className="mp-subtitle">Automated assessment of the pollution evidence.</div>

                <div style={{ marginTop: 14, padding: 16, background: "var(--bg-2)", borderRadius: 12, border: "1px solid var(--border-mp)" }}>
                  <div style={{ color: "var(--text-mp)", fontSize: 14, lineHeight: 1.5 }}>
                    {r.aiDescription || "Analysing evidence..."}
                  </div>
                </div>

                {r.aiStatus === "pending" && (
                  <button className="mp-btn mp-btn-primary" style={{ marginTop: 14 }} onClick={generateAI}>
                    Generate Description
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: "grid", gap: 20, alignContent: "start" }}>
            <div className="mp-card">
              <div className="mp-card-inner">
                <div className="mp-title" style={{ fontSize: 18 }}>Location Details</div>
                <div style={{ marginTop: 10, fontSize: 14, color: "var(--muted-mp)" }}>{r.address || "No address provided."}</div>

                <div style={{ marginTop: 14, borderRadius: 14, overflow: "hidden", border: "1px solid var(--border-mp)", height: 260 }}>
                  <MapContainer 
                    center={[r.location?.coordinates?.[1] || 6.9, r.location?.coordinates?.[0] || 79.8]} 
                    zoom={13} 
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[r.location?.coordinates?.[1] || 6.9, r.location?.coordinates?.[0] || 79.8]} />
                  </MapContainer>
                </div>
              </div>
            </div>

            <div className="mp-card">
              <div className="mp-card-inner">
                <div className="mp-title" style={{ fontSize: 18 }}>Action Controls</div>
                <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
                  {!r.isPublished && (
                    <button className="mp-btn mp-btn-primary" onClick={publishReport}>
                      Publish Report
                    </button>
                  )}
                  <button className="mp-btn mp-btn-danger" onClick={deleteReport}>
                    Delete Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </div>
  );
}
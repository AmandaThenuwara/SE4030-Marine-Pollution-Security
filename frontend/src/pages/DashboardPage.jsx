import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api.js";
import AppShell from "../components/AppShell.jsx";
import { useAuth } from "../context/AuthContext";

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function DashboardPage() {
  const { isAdmin } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [publishedFilter, setPublishedFilter] = useState("all");
  const [pageSize, setPageSize] = useState(6);
  const [page, setPage] = useState(1);

  async function loadReports() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/ch/reports");
      setReports(res.data.reports || []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return reports.filter((r) => {
      const matchesSeverity = severityFilter === "all" ? true : r.severity === severityFilter;

      const matchesPublished =
        publishedFilter === "all"
          ? true
          : publishedFilter === "published"
          ? r.isPublished === true
          : r.isPublished === false;

      const haystack = [r.title, ...(r.categories || []), r.otherCategoryText, r.finalDescription, r.aiDescription]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = q ? haystack.includes(q) : true;

      return matchesSeverity && matchesPublished && matchesSearch;
    });
  }, [reports, search, severityFilter, publishedFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const paged = useMemo(() => {
    const safePage = Math.min(Math.max(page, 1), totalPages);
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [search, severityFilter, publishedFilter, pageSize]);

  const isDark = isAdmin();
  
  return (
    <div className={isDark ? "dark min-h-screen bg-[#020617]" : "min-h-screen bg-slate-50"}>
      <AppShell
        title="Dashboard"
        subtitle="Search, filter and manage your reports."
        rightActions={
          <Link className="mp-btn mp-btn-primary" to="/reports/new">
            + New Report
          </Link>
        }
      >
        {error ? <div className="mp-alert-error" style={{ marginBottom: 14 }}>{error}</div> : null}
  
        <div className="mp-card">
          <div className="mp-card-inner" style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "grid", gap: 14, gridTemplateColumns: "2fr 1fr 1fr" }}>
              <div>
                <div className="mp-label">Search</div>
                <input
                  className="mp-input"
                  placeholder="Search title, categories, descriptions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
  
              <div>
                <div className="mp-label">Severity</div>
                <select className="mp-select" value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
                  <option value="all">All</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
  
              <div>
                <div className="mp-label">Published</div>
                <select className="mp-select" value={publishedFilter} onChange={(e) => setPublishedFilter(e.target.value)}>
                  <option value="all">All</option>
                  <option value="published">Published</option>
                  <option value="unpublished">Unpublished</option>
                </select>
              </div>
            </div>
  
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ color: "var(--muted-mp)", fontSize: 13 }}>
                Showing <span style={{ fontWeight: 900, color: "var(--brand)" }}>{filtered.length}</span> report(s)
              </div>
  
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <span className="mp-label">Page size</span>
                <select className="mp-select" style={{ width: 90 }} value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                  <option value={6}>6</option>
                  <option value={9}>9</option>
                  <option value={12}>12</option>
                </select>
  
                <button className="mp-btn mp-btn-secondary" onClick={loadReports}>
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
  
        <div style={{ marginTop: 18 }}>
          {loading ? (
            <div className="mp-card">
              <div className="mp-card-inner">Loading reports...</div>
            </div>
          ) : paged.length === 0 ? (
            <div className="mp-card">
              <div className="mp-card-inner">
                No reports found. Click <b>+ New Report</b> to create one.
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
              {paged.map((r) => (
                <Link key={r._id} to={`/reports/${r._id}`} className="mp-card" style={{ textDecoration: "none" }}>
                  <div className="mp-card-inner">
                    <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid var(--border-mp)" }}>
                      <div style={{ aspectRatio: "16/9", background: "var(--bg-2)" }}>
                        {r.photoUrl ? (
                          <img src={r.photoUrl} alt={r.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : null}
                      </div>
                    </div>
  
                    <div style={{ marginTop: 12, fontWeight: 900, fontSize: 16 }}>{r.title}</div>
  
                    <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <span className="mp-chip">Severity: {r.severity}</span>
                      <span className="mp-chip">{r.isPublished ? "Published" : "Draft"}</span>
                      <span className="mp-chip">AI: {r.aiStatus}</span>
                    </div>
  
                    <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {(r.categories || []).slice(0, 3).map((c) => (
                        <span key={c} className="mp-chip">
                          {c}
                        </span>
                      ))}
                      {(r.categories || []).length > 3 ? (
                        <span style={{ fontSize: 12, color: "var(--muted-mp)" }}>
                          +{(r.categories || []).length - 3} more
                        </span>
                      ) : null}
                    </div>
  
                    <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted-mp)" }}>
                      Created: {formatDate(r.createdAt)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
  
        <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div style={{ fontSize: 13, color: "var(--muted-mp)" }}>
            Page <b style={{ color: "var(--text-mp)" }}>{page}</b> of{" "}
            <b style={{ color: "var(--text-mp)" }}>{totalPages}</b>
          </div>
  
          <div style={{ display: "flex", gap: 10 }}>
            <button className="mp-btn mp-btn-secondary" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Prev
            </button>
            <button className="mp-btn mp-btn-secondary" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
              Next
            </button>
          </div>
        </div>
      </AppShell>
    </div>
  );
}
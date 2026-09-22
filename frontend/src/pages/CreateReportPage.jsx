import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import api from "../api/api.js";
import AppShell from "../components/AppShell.jsx";
import { useAuth } from "../context/AuthContext";

// Leaflet icon fix for Vite/React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url).toString(),
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).toString(),
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url).toString(),
});

const CATEGORY_OPTIONS = [
  "Plastic",
  "Glass",
  "Metal",
  "Fishing nets / gear",
  "Organic waste",
  "Oil spill",
  "Sewage / wastewater",
  "Construction debris",
  "Dead animal",
  "Other",
];

function LocationPicker({ value, onChange }) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return value ? <Marker position={[value.lat, value.lng]} /> : null;
}

export default function CreateReportPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState("low");
  const [address, setAddress] = useState("");

  const [categories, setCategories] = useState([]);
  const [otherCategoryText, setOtherCategoryText] = useState("");

  const [location, setLocation] = useState(null);

  const [photoFile, setPhotoFile] = useState(null);
  const photoPreview = useMemo(() => (photoFile ? URL.createObjectURL(photoFile) : ""), [photoFile]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleCategory(cat) {
    setCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!photoFile) return setError("Please upload a photo.");
    if (!location) return setError("Please select a location on the map.");
    if (!title.trim()) return setError("Title is required.");
    if (categories.length === 0) return setError("Select at least one category.");

    const hasOther = categories.includes("Other");
    if (hasOther && !otherCategoryText.trim()) return setError("Please specify the Other category text.");

    setLoading(true);
    try {
      const form = new FormData();
      form.append("photo", photoFile);
      form.append("title", title.trim());
      categories.forEach((c) => form.append("categories", c));
      form.append("severity", severity);
      form.append("lat", String(location.lat));
      form.append("lng", String(location.lng));
      if (address.trim()) form.append("address", address.trim());
      if (hasOther) form.append("otherCategoryText", otherCategoryText.trim());

      const res = await api.post("/ch/reports", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const id = res.data?.report?._id;
      navigate(`/reports/${id}`, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to create report");
    } finally {
      setLoading(false);
    }
  }

  const isDark = isAdmin();

  return (
    <div className={isDark ? "dark min-h-screen bg-[#020617]" : "min-h-screen bg-slate-50"}>
      <AppShell
        title="Create Report"
        subtitle="Upload a photo, pick location, and create a draft report."
        rightActions={
          <Link to="/reports-dashboard" className="mp-btn mp-btn-secondary">
            Dashboard
          </Link>
        }
      >
        {error ? <div className="mp-alert-error" style={{ marginBottom: 14 }}>{error}</div> : null}

        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1.05fr 0.95fr" }}>
          {/* Form */}
          <div className="mp-card">
            <div className="mp-card-inner">
              <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
                <div>
                  <div className="mp-label">Title</div>
                  <input className="mp-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Plastic waste near shoreline" />
                </div>

                <div style={{ display: "grid", gap: 14, gridTemplateColumns: "1fr 1fr" }}>
                  <div>
                    <div className="mp-label">Severity</div>
                    <select className="mp-select" value={severity} onChange={(e) => setSeverity(e.target.value)}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <div className="mp-label">Address (optional)</div>
                    <input className="mp-input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g., Mount Lavinia Beach" />
                  </div>
                </div>

                <div>
                  <div className="mp-label">Categories (multi-select)</div>
                  <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {CATEGORY_OPTIONS.map((cat) => {
                      const active = categories.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          className={active ? "mp-btn mp-btn-primary" : "mp-btn mp-btn-secondary"}
                          style={{ padding: "8px 10px", borderRadius: 999, fontSize: 13 }}
                          onClick={() => toggleCategory(cat)}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {categories.includes("Other") ? (
                  <div>
                    <div className="mp-label">Other category</div>
                    <input className="mp-input" value={otherCategoryText} onChange={(e) => setOtherCategoryText(e.target.value)} placeholder="Type the other category..." />
                  </div>
                ) : null}

                <div>
                  <div className="mp-label">Photo</div>
                  <input
                    style={{ marginTop: 10 }}
                    className="mp-input"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  />

                  {photoPreview ? (
                    <div style={{ marginTop: 12, borderRadius: 14, overflow: "hidden", border: "1px solid var(--border-mp)" }}>
                      <img src={photoPreview} alt="Preview" style={{ width: "100%", height: "auto", display: "block" }} />
                    </div>
                  ) : null}
                </div>

                <button className="mp-btn mp-btn-primary" disabled={loading} type="submit">
                  {loading ? "Creating..." : "Create Draft"}
                </button>

                <div className="mp-subtitle">
                  Tip: Click on the map to set location. Draft requires photo + location.
                </div>
              </form>

              <div style={{ marginTop: 10 }}>
                <Link to="/reports-dashboard" className="mp-btn mp-btn-secondary">
                  ← Back
                </Link>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="mp-card">
            <div className="mp-card-inner">
              <div className="mp-title" style={{ fontSize: 18 }}>Pick Location</div>
              <div className="mp-subtitle">Click on the map to place a marker.</div>

              <div style={{ marginTop: 14, borderRadius: 16, overflow: "hidden", border: "1px solid var(--border-mp)" }}>
                <MapContainer center={[6.9271, 79.8612]} zoom={10} style={{ height: 420, width: "100%" }}>
                  <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationPicker value={location} onChange={setLocation} />
                </MapContainer>
              </div>

              <div style={{ marginTop: 12, fontSize: 13, color: "var(--muted-mp)" }}>
                {location ? (
                  <span>
                    Selected: <b style={{ color: "var(--brand)" }}>{location.lat.toFixed(5)}, {location.lng.toFixed(5)}</b>
                  </span>
                ) : (
                  <span>No location selected yet.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </div>
  );
}
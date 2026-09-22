import { useMemo, useState } from "react";
import api from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import AppShell from "../components/AppShell.jsx";

export default function ProfilePage() {
  const { user, refreshMe } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [role, setRole] = useState(user?.role || "general");
  const [bio, setBio] = useState(user?.bio || "");

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [file, setFile] = useState(null);
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

  async function saveProfile() {
    setError("");
    setNotice("");
    setSaving(true);
    try {
      await api.patch("/api/ch/users/me", {
        name: name.trim(),
        phone: phone.trim(),
        role,
        bio: bio.trim(),
      });
      await refreshMe();
      setNotice("Profile updated.");
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  async function uploadProfilePic() {
    if (!file) {
      setError("Please choose a profile picture first.");
      return;
    }
    setError("");
    setNotice("");
    setUploading(true);
    try {
      const form = new FormData();
      form.append("profilePic", file);

      await api.post("/api/ch/users/me/profile-pic", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setFile(null);
      await refreshMe();
      setNotice("Profile picture updated.");
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to upload picture");
    } finally {
      setUploading(false);
    }
  }

  return (
    <AppShell title="Profile" subtitle="Update your profile details and picture.">
      {error ? <div className="mp-alert-error" style={{ marginBottom: 14 }}>{error}</div> : null}
      {notice ? <div className="mp-alert-success" style={{ marginBottom: 14 }}>{notice}</div> : null}

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "0.9fr 1.1fr" }}>
        {/* Picture */}
        <div className="mp-card">
          <div className="mp-card-inner">
            <div className="mp-title" style={{ fontSize: 18 }}>Profile Picture</div>
            <div className="mp-subtitle">Upload a new picture for your account.</div>

            <div style={{ marginTop: 14, display: "flex", gap: 12, alignItems: "center" }}>
              {user?.profilePicUrl ? (
                <img
                  src={user.profilePicUrl}
                  alt="Current"
                  style={{ width: 86, height: 86, borderRadius: 18, objectFit: "cover", border: "1px solid rgba(255,255,255,0.10)" }}
                />
              ) : (
                <div
                  style={{
                    width: 86,
                    height: 86,
                    borderRadius: 18,
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "rgba(255,255,255,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: 26,
                  }}
                >
                  {(user?.name || "U").slice(0, 1).toUpperCase()}
                </div>
              )}

              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.62)" }}>
                <div style={{ color: "rgba(255,255,255,0.92)", fontWeight: 800 }}>{user?.email}</div>
                <div>Role: {user?.role}</div>
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <div className="mp-label">Select image</div>
              <input className="mp-input" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />

              {preview ? (
                <div style={{ marginTop: 12, borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <img src={preview} alt="Preview" style={{ width: "100%", height: "auto", display: "block" }} />
                </div>
              ) : null}

              <button className="mp-btn mp-btn-primary" disabled={uploading} onClick={uploadProfilePic} style={{ marginTop: 12, width: "100%" }}>
                {uploading ? "Uploading..." : "Upload picture"}
              </button>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="mp-card">
          <div className="mp-card-inner">
            <div className="mp-title" style={{ fontSize: 18 }}>Profile Details</div>
            <div className="mp-subtitle">Update your name, phone, role and bio.</div>

            <div style={{ marginTop: 14, display: "grid", gap: 14, gridTemplateColumns: "1fr 1fr" }}>
              <div>
                <div className="mp-label">Name</div>
                <input className="mp-input" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div>
                <div className="mp-label">Phone</div>
                <input className="mp-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>

              <div>
                <div className="mp-label">Role</div>
                <select className="mp-select" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="general">General User</option>
                  <option value="volunteer">Volunteer</option>
                </select>
                <div className="mp-subtitle" style={{ marginTop: 6 }}>
                  Volunteer features will be added later.
                </div>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <div className="mp-label">Bio</div>
                <textarea className="mp-textarea" rows={5} value={bio} onChange={(e) => setBio(e.target.value)} />
              </div>
            </div>

            <button className="mp-btn mp-btn-primary" disabled={saving} onClick={saveProfile} style={{ marginTop: 12, width: "100%" }}>
              {saving ? "Saving..." : "Save profile"}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
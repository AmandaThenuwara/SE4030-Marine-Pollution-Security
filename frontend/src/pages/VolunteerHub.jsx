import React, { useState, useEffect } from "react";
import {
    getVolunteers,
    addVolunteer,
    deleteVolunteer,
    updateVolunteer,
} from "../api/volunteerApi";
import { useAuth } from "../context/AuthContext";
import { Globe } from "lucide-react";

/* ─── Inline animation styles only (no theme overrides) ─────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  body { font-family: 'Inter', sans-serif; }
  .vol-card { transition: box-shadow 0.25s ease, border-color 0.25s ease; }
  .vol-card:hover { box-shadow: 0 6px 20px -4px rgba(0,0,0,0.08); border-color: #bfdbfe; }
  .photo-preview img { transition: transform 0.3s ease; }
  .photo-preview:hover img { transform: scale(1.04); }
  .drag-drop-zone { border: 2px dashed #cbd5e1; transition: border-color 0.2s, background 0.2s; }
  .drag-drop-zone:hover { border-color: #3b82f6; background: #eff6ff; }
  .calendar-day { transition: background 0.15s, transform 0.15s; }
  .calendar-day:hover:not(:disabled) { background: #eff6ff; transform: scale(1.05); }
  .calendar-day.selected { background: #2563eb; color: #fff; }
  .skill-tag { transition: transform 0.15s; }
  .skill-tag:hover { transform: translateY(-2px); }
  .modal { display: none; position: fixed; z-index: 200; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background: rgba(15,23,42,0.45); animation: fadeIn 0.25s ease; }
  .modal.active { display: flex; align-items: center; justify-content: center; padding: 2rem 1rem; }
  .modal-content { animation: slideUp 0.25s ease; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .notification { position: fixed; top: 88px; right: 20px; z-index: 250; animation: slideInRight 0.3s ease; }
  @keyframes slideInRight { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
`;

/* ─── Shared Input style helper ──────────────────────────────────────── */
const inputCls = (err, touched, val) =>
    `w-full px-4 py-2.5 border-2 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 bg-white transition-all focus:outline-none focus:ring-2 ${
        err && touched
            ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
            : touched && !err && val
            ? "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-100"
            : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
    }`;

const VolunteerHub = () => {
    const [volunteers, setVolunteers] = useState([]);
    const [currentView, setCurrentView] = useState("volunteer");
    const [notification, setNotification] = useState("");
    const [notificationType, setNotificationType] = useState("info");
    const { user, isAdmin } = useAuth();

    useEffect(() => {
        setCurrentView(isAdmin() ? "admin" : "volunteer");
    }, [isAdmin]);

    const [isRegModalOpen, setIsRegModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [name, setName] = useState("");
    const [contact, setContact] = useState("");
    const [role, setRole] = useState("individual");
    const [teamSize, setTeamSize] = useState("");
    const [description, setDescription] = useState("");
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [selectedDates, setSelectedDates] = useState([]);
    const [selectedTimes, setSelectedTimes] = useState([]);
    const [profilePicture, setProfilePicture] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [city, setCity] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [travelDistance, setTravelDistance] = useState(11);
    const [formErrors, setFormErrors] = useState({});
    const [formTouched, setFormTouched] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("");
    const [sizeFilter, setSizeFilter] = useState("all");
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedVolunteer, setSelectedVolunteer] = useState(null);
    const [isAssignTaskOpen, setIsAssignTaskOpen] = useState(false);
    const [assignTarget, setAssignTarget] = useState(null);

    useEffect(() => { fetchVolunteers(); }, []);

    const fetchVolunteers = async () => {
        try {
            const res = await getVolunteers();
            setVolunteers(res.data);
        } catch (err) {
            console.error("Error fetching volunteers:", err);
            showNotification("Failed to fetch volunteers", "error");
        }
    };

    const showNotification = (msg, type = "info") => {
        setNotification(msg);
        setNotificationType(type);
        setTimeout(() => setNotification(""), 3000);
    };

    const resetForm = () => {
        setEditingId(null); setName(""); setContact(""); setRole("individual");
        setTeamSize(""); setDescription(""); setSelectedSkills([]);
        setSelectedDates([]); setSelectedTimes([]); setProfilePicture(null);
        setCurrentMonth(new Date()); setCity(""); setPostalCode("");
        setTravelDistance(11); setFormErrors({}); setFormTouched({});
    };

    const openRegModal = (volunteer = null) => {
        if (volunteer) {
            setEditingId(volunteer._id || volunteer.id);
            setName(volunteer.name || ""); setContact(volunteer.contact || "");
            setRole(volunteer.role || "individual"); setTeamSize(volunteer.teamSize || "");
            setDescription(volunteer.description || ""); setSelectedSkills(volunteer.skills || []);
            const dates = volunteer.availabilityDates || [];
            setSelectedDates(dates.filter(d => !['Morning', 'Midday', 'Afternoon'].includes(d)));
            setSelectedTimes(dates.filter(d => ['Morning', 'Midday', 'Afternoon'].includes(d)));
            setProfilePicture(volunteer.profilePicture || null);
            setCity(volunteer.city || ""); setPostalCode(volunteer.postalCode || "");
            setTravelDistance(volunteer.travelDistance || 11);
            setFormErrors({}); setFormTouched({});
        } else { resetForm(); }
        setIsRegModalOpen(true);
    };

    const validateVolunteerField = (fieldName, value) => {
        switch (fieldName) {
            case 'name':
                if (!value?.trim()) return 'Name is required';
                if (value.trim().length < 2) return 'Name must be at least 2 characters';
                if (value.trim().length > 50) return 'Name must be less than 50 characters';
                if (!/^[a-zA-Z\s]+$/.test(value.trim())) return 'Name should contain only letters';
                return '';
            case 'contact':
                if (!value?.trim()) return 'Contact is required';
                if (!/^[0-9+\-\s()]{7,15}$/.test(value.trim())) return 'Please enter a valid phone number';
                return '';
            case 'teamSize':
                if (role === 'team') {
                    const size = parseInt(value);
                    if (!value || isNaN(size)) return 'Team size is required';
                    if (size < 2) return 'Team must have at least 2 members';
                    if (size > 100) return 'Team size cannot exceed 100';
                }
                return '';
            case 'city':
                if (!value?.trim()) return 'City is required';
                if (value.trim().length < 2) return 'City must be at least 2 characters';
                if (/\d/.test(value)) return 'City cannot contain numbers';
                if (!/^[a-zA-Z\s\-']+$/.test(value.trim())) return 'City should contain only letters';
                return '';
            case 'postalCode':
                if (value?.trim()) {
                    if (/[a-zA-Z]/.test(value)) return 'Postal code cannot contain letters';
                    if (!/^[0-9\s\-]+$/.test(value.trim())) return 'Postal code should contain only numbers';
                }
                return '';
            default: return '';
        }
    };

    const handleFieldChange = (fieldName, value, setter) => {
        setter(value);
        if (formTouched[fieldName]) setFormErrors(prev => ({ ...prev, [fieldName]: validateVolunteerField(fieldName, value) }));
    };

    const handleFieldBlur = (fieldName, value) => {
        setFormTouched(prev => ({ ...prev, [fieldName]: true }));
        setFormErrors(prev => ({ ...prev, [fieldName]: validateVolunteerField(fieldName, value) }));
    };

    const validateVolunteerForm = () => {
        const errors = {
            name: validateVolunteerField('name', name),
            contact: validateVolunteerField('contact', contact),
            city: validateVolunteerField('city', city),
            ...(role === 'team' ? { teamSize: validateVolunteerField('teamSize', teamSize) } : {}),
        };
        setFormErrors(errors);
        setFormTouched({ name: true, contact: true, city: true, teamSize: true });
        return !errors.name && !errors.contact && !errors.city && (role !== 'team' || !errors.teamSize);
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        if (!validateVolunteerForm()) { showNotification("Please fix the form errors", "warning"); return; }
        if (selectedDates.length === 0 && selectedTimes.length === 0) {
            showNotification("Please select at least one availability option", "warning"); return;
        }
        const payload = {
            name, contact, role,
            teamSize: role === "team" ? parseInt(teamSize) || 2 : 1,
            description, skills: selectedSkills,
            availabilityDates: [...selectedDates, ...selectedTimes],
            profilePicture: profilePicture || "https://via.placeholder.com/150",
            city, postalCode, travelDistance: parseInt(travelDistance) || 11,
            userId: user?.id || user?._id,
        };
        try {
            if (editingId) {
                await updateVolunteer(editingId, payload);
                showNotification("Volunteer profile updated successfully!", "success");
            } else {
                await addVolunteer(payload);
                showNotification("Volunteer registered successfully!", "success");
            }
            setIsRegModalOpen(false); resetForm(); fetchVolunteers();
        } catch (err) {
            console.error(err); showNotification("Failed to save volunteer", "error");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this volunteer?")) {
            try {
                await deleteVolunteer(id);
                showNotification("Volunteer deleted", "success");
                fetchVolunteers(); setIsDetailsOpen(false);
            } catch (err) { console.error(err); showNotification("Failed to delete volunteer", "error"); }
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) { const r = new FileReader(); r.onload = ev => setProfilePicture(ev.target.result); r.readAsDataURL(file); }
    };

    const toggleSkill = (skill) =>
        setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);

    const toggleDate = (dateStr, dayStr) =>
        setSelectedDates(prev => {
            if (prev.includes(dateStr)) return prev.filter(d => d !== dateStr);
            showNotification(`Selected ${dayStr}`, "success");
            return [...prev, dateStr];
        });

    const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

    const renderCalendarDays = () => {
        const year = currentMonth.getFullYear(), month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(<div key={`e-${i}`} />);
        for (let day = 1; day <= daysInMonth; day++) {
            const dateObj = new Date(year, month, day);
            const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
            const isSelected = selectedDates.includes(dateStr);
            const isPast = dateObj < new Date().setHours(0,0,0,0);
            days.push(
                <button key={day} type="button" onClick={() => toggleDate(dateStr, dayNames[dateObj.getDay()])}
                    disabled={isPast}
                    className={`calendar-day p-2 rounded-lg text-center text-sm font-medium ${isSelected ? 'selected' : 'bg-white border border-slate-200 text-slate-700 hover:bg-blue-50'} ${isPast ? 'opacity-40 cursor-not-allowed' : ''}`}>
                    {day}
                </button>
            );
        }
        return days;
    };

    const toggleTime = (time) =>
        setSelectedTimes(prev => prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]);

    const filteredVolunteers = volunteers.filter(v => {
        const matchesSearch = v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.skills?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesType = typeFilter === "all" || v.role === typeFilter;
        const matchesDate = !dateFilter || v.availabilityDates?.includes(dateFilter);
        const matchesSize = (() => {
            if (sizeFilter === "all") return true;
            if (sizeFilter === "1-5") return v.teamSize >= 1 && v.teamSize <= 5;
            if (sizeFilter === "6-10") return v.teamSize >= 6 && v.teamSize <= 10;
            if (sizeFilter === "11+") return v.teamSize >= 11;
            return true;
        })();
        return matchesSearch && matchesType && matchesDate && matchesSize;
    });

    const totalVolunteers = volunteers.length;
    const totalTeams = volunteers.filter(v => v.role === "team").length;
    const totalIndividuals = volunteers.filter(v => v.role === "individual").length;
    const totalWorkforce = volunteers.reduce((acc, v) => acc + (parseInt(v.teamSize) || 1), 0);
    const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}-${String(new Date().getDate()).padStart(2,'0')}`;
    const adminAvailableNow = volunteers.filter(v => v.availabilityDates?.includes(todayStr)).length;
    const adminWithEquipment = volunteers.filter(v => v.skills?.length > 0).length;

    /* ── Notification colors ── */
    const notifColor = notificationType === 'success' ? 'bg-emerald-600' : notificationType === 'error' ? 'bg-rose-600' : notificationType === 'warning' ? 'bg-amber-600' : 'bg-blue-600';

    /* ── Shared label style ── */
    const labelCls = "block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2";

    return (
        <div className={`${currentView === 'admin' ? 'bg-[#020617]' : 'bg-slate-50'} min-h-screen pt-32 transition-colors duration-500`}>
            <style>{styles}</style>

            {/* Notification */}
            {notification && (
                <div className={`notification px-6 py-3.5 rounded-xl shadow-lg text-white text-sm font-semibold ${notifColor}`}>
                    {notification}
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

                {/* ══ VOLUNTEER VIEW ══════════════════════════════════════ */}
                {currentView === 'volunteer' && (
                    <div>
                        {/* Page Header (Redesigned with Navy Theme) */}
                        <div style={{
                            background: 'linear-gradient(155deg, #0a1628 0%, #0f2444 35%, #162d4a 70%, #1a3a5c 100%)',
                            borderRadius: '1.5rem',
                            padding: '3rem',
                            marginBottom: '2rem',
                            position: 'relative',
                            overflow: 'hidden',
                        }}>
                            {/* Background light blobs for premium feel */}
                            <div style={{
                                position: 'absolute', top: '-20%', right: '-10%',
                                width: '300px', height: '300px', borderRadius: '50%',
                                background: 'rgba(56, 189, 248, 0.08)', filter: 'blur(60px)',
                            }} />
                            <div style={{
                                position: 'absolute', bottom: '-20%', left: '-5%',
                                width: '200px', height: '200px', borderRadius: '50%',
                                background: 'rgba(14, 165, 233, 0.12)', filter: 'blur(50px)',
                            }} />

                            <div style={{ position: 'relative', zIndex: 2 }}>
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                                    padding: '6px 16px', borderRadius: '999px',
                                    background: 'rgba(14, 165, 233, 0.12)', border: '1px solid rgba(14, 165, 233, 0.3)',
                                    color: '#7dd3fc', fontSize: '11px', fontWeight: 500, letterSpacing: '0.12em',
                                    textTransform: 'uppercase', marginBottom: '1.5rem',
                                }}>
                                    <Globe size={13} strokeWidth={2} />
                                    Volunteer Hub
                                </div>
                                <h2 className="text-3xl md:text-4xl font-normal text-white mb-4 tracking-tight">Join the Ocean Cleanup Movement</h2>
                                <p className="text-slate-300 text-sm md:text-base mb-8 max-w-2xl font-normal leading-relaxed">
                                    Become a marine cleanup volunteer and take action to protect ocean life and coastal communities. Join a global network of dedicated ocean guardians.
                                </p>
                                <button onClick={() => openRegModal()} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl font-normal text-sm transition-all hover:-translate-y-0.5 active:scale-95 shadow-lg shadow-blue-900/40">
                                    <i className="fas fa-plus-circle" /> Register Now
                                </button>
                            </div>
                        </div>



                        {/* Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                            {[
                                { label: 'Total Volunteers', value: totalVolunteers, icon: 'fa-users', color: 'text-blue-600 bg-blue-50' },
                                { label: 'Active Teams', value: totalTeams, icon: 'fa-user-friends', color: 'text-teal-600 bg-teal-50' },
                                { label: 'Individuals', value: totalIndividuals, icon: 'fa-user', color: 'text-indigo-600 bg-indigo-50' },
                                { label: 'Total Workforce', value: totalWorkforce, icon: 'fa-hard-hat', color: 'text-slate-600 bg-slate-100' },
                            ].map(card => (
                                <div key={card.label} className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-4 vol-card">
                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.color} shrink-0`}>
                                        <i className={`fas ${card.icon}`} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">{card.label}</p>
                                        <p className="text-2xl font-bold text-slate-800">{card.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Volunteer Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredVolunteers.length === 0 ? (
                                <div className="col-span-full bg-white border border-slate-200 rounded-2xl py-20 text-center">
                                    <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                        <i className="fas fa-users text-2xl" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-2">No Volunteers Yet</h3>
                                    <p className="text-slate-500 text-sm mb-6">Be the first to register or adjust your filters.</p>
                                    <button onClick={() => openRegModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition">
                                        Register Now
                                    </button>
                                </div>
                            ) : (
                                filteredVolunteers.map(v => (
                                    <div key={v._id || v.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden vol-card">
                                        <div className="relative photo-preview">
                                            <img src={v.profilePicture} alt={v.name} className="w-full h-44 object-cover" />
                                            <span className={`absolute top-3 right-3 px-3 py-1 rounded-lg text-xs font-semibold tracking-wide ${v.role === 'team' ? 'bg-teal-600 text-white' : 'bg-blue-600 text-white'}`}>
                                                <i className={`fas fa-${v.role === 'team' ? 'users' : 'user'} mr-1`} />
                                                {v.role === 'team' ? 'Team' : 'Individual'}
                                            </span>
                                        </div>
                                        <div className="p-5">
                                            <h3 className="text-base font-bold text-slate-800 mb-1">{v.name}</h3>
                                            <div className="flex items-center text-slate-400 text-xs mb-3 gap-1.5">
                                                <i className="fas fa-users" />
                                                <span>{v.teamSize} {v.teamSize === 1 ? 'person' : 'people'}</span>
                                            </div>
                                            {v.description && <p className="text-slate-500 text-sm mb-3 line-clamp-2">{v.description}</p>}
                                            {v.skills?.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mb-3">
                                                    {v.skills.slice(0, 3).map(skill => (
                                                        <span key={skill} className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-lg text-xs font-medium">{skill}</span>
                                                    ))}
                                                    {v.skills.length > 3 && <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg text-xs">+{v.skills.length - 3}</span>}
                                                </div>
                                            )}
                                            <div className="flex items-center text-xs text-slate-400 mb-4 gap-1.5">
                                                <i className="fas fa-calendar-check" />
                                                <span>{v.availabilityDates?.length || 0} days available</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => { setSelectedVolunteer(v); setIsDetailsOpen(true); }}
                                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-sm font-semibold transition">
                                                    View Details
                                                </button>
                                                {(isAdmin() || v.userId === (user?.id || user?._id)) && (
                                                    <button onClick={() => openRegModal(v)}
                                                        className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition text-sm">
                                                        <i className="fas fa-edit" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* ══ ADMIN VIEW ══════════════════════════════════════════ */}
                {currentView === 'admin' && (
                    <div className="pb-16">
                        {/* Admin Header */}
                        <div className="bg-[#111827] border border-[#1f2937] rounded-3xl p-8 mb-8">
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#2dd4bf] mb-3">Management Console</p>
                            <h2 className="text-4xl font-black text-white mb-3 tracking-tight">Admin Dashboard</h2>
                            <p className="text-[#94a3b8] text-base font-medium max-w-2xl">High-level oversight of marine volunteer operations, workforce allocation, and strategic task assignment.</p>
                        </div>

                        {/* Admin Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {[
                                { label: 'Available Now', value: adminAvailableNow, icon: 'fa-clock', color: 'text-[#2dd4bf] bg-[#111827] border-[#2dd4bf]/20' },
                                { label: 'With Equipment', value: adminWithEquipment, icon: 'fa-tools', color: 'text-[#06b6d4] bg-[#111827] border-[#06b6d4]/20' },
                                { label: 'Total Capacity', value: totalWorkforce, icon: 'fa-users-cog', color: 'text-[#3b82f6] bg-[#111827] border-[#3b82f6]/20' },
                            ].map(card => (
                                <div key={card.label} className="bg-[#111827] border border-[#1f2937] rounded-3xl p-7 flex items-center gap-6 transition-all hover:border-[#334155] group">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${card.color} shrink-0 transition-transform group-hover:scale-105`}>
                                        <i className={`fas ${card.icon} text-2xl`} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-[#475569] uppercase tracking-[0.15em] mb-1.5">{card.label}</p>
                                        <p className="text-3xl font-black text-white tracking-tight">{card.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Volunteer Table */}
                        <div className="bg-[#111827] border border-[#1f2937] rounded-3xl overflow-hidden shadow-2xl shadow-black/60">
                            <div className="px-8 py-6 border-b border-[#1f2937] flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-white tracking-tight">Volunteer Personnel</h3>
                                    <p className="text-xs text-[#475569] font-bold uppercase tracking-widest mt-1">Real-time status tracking</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold text-[#2dd4bf] uppercase tracking-widest bg-[#134e4a]/30 px-4 py-1.5 rounded-full border border-[#115e59]/50">{volunteers.length} Verified Records</span>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead className="bg-[#0f172a]">
                                        <tr>
                                            {['Personnel','Status','Workforce','Availability','Core Skills','Commands'].map(h => (
                                                <th key={h} className="px-8 py-5 text-left text-[11px] font-bold text-[#475569] uppercase tracking-[0.2em] border-b border-[#1f2937]">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#1f2937]">
                                        {volunteers.map(v => (
                                            <tr key={v._id || v.id} className="hover:bg-[#1e293b]/50 transition-colors group">
                                                <td className="px-8 py-6 whitespace-nowrap">
                                                    <div className="flex items-center gap-5">
                                    {/* Initials Avatar */}
                                    <div className="w-12 h-12 rounded-2xl bg-[#1e293b] border border-[#334155] flex items-center justify-center shrink-0">
                                        <span className="text-lg font-black text-[#2dd4bf] uppercase">
                                            {v.name?.charAt(0)}
                                        </span>
                                    </div>
                                                        <div>
                                                            <div className="text-base font-bold text-white group-hover:text-[#2dd4bf] transition-colors tracking-tight">{v.name}</div>
                                                            <div className="text-[11px] text-[#475569] font-bold tracking-[0.05em] mt-0.5 uppercase">{v.contact}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 whitespace-nowrap">
                                                    <span className={`px-3 py-1.5 inline-flex text-[10px] font-bold uppercase tracking-[0.1em] rounded-xl ${v.role === 'team' ? 'bg-[#134e4a]/50 text-[#2dd4bf] border border-[#115e59]/50' : 'bg-[#0c4a6e]/50 text-[#38bdf8] border border-[#075985]/50'}`}>
                                                        {v.role}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 whitespace-nowrap text-sm font-bold text-[#94a3b8]">
                                                    {v.teamSize} {v.teamSize === 1 ? 'UNIT' : 'UNITS'}
                                                </td>
                                                <td className="px-8 py-6 text-sm font-bold text-[#94a3b8]">{v.availabilityDates?.length} ACTIVE DAYS</td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-wrap gap-2">
                                                        {v.skills?.slice(0,2).map(skill => (
                                                            <span key={skill} className="px-2.5 py-1 text-[10px] font-bold bg-[#1e293b] text-[#64748b] border border-[#334155] rounded-xl">{skill}</span>
                                                        ))}
                                                        {v.skills?.length > 2 && <span className="text-[10px] font-bold text-[#334155] ml-1">+{v.skills.length - 2} MORE</span>}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 whitespace-nowrap">
                                                    <div className="flex items-center gap-6">
                                                        <button onClick={() => { setAssignTarget(v); setIsAssignTaskOpen(true); }}
                                                            className="text-[#2dd4bf] hover:text-white font-black text-[10px] flex items-center gap-2 transition-all uppercase tracking-[0.2em] group/btn">
                                                            <i className="fas fa-tasks text-sm transition-transform group-hover/btn:-translate-y-0.5" /> <span>Assign</span>
                                                        </button>
                                                        <button onClick={() => { setSelectedVolunteer(v); setIsDetailsOpen(true); }}
                                                            className="text-[#38bdf8] hover:text-white font-black text-[10px] flex items-center gap-2 transition-all uppercase tracking-[0.2em] group/btn">
                                                            <i className="fas fa-eye text-sm transition-transform group-hover/btn:-translate-y-0.5" /> <span>View</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {volunteers.length === 0 && (
                                    <div className="py-24 text-center">
                                        <div className="w-16 h-16 bg-[#1e293b] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#334155]">
                                            <i className="fas fa-database text-[#475569] text-xl" />
                                        </div>
                                        <p className="text-[#475569] font-bold text-sm uppercase tracking-widest">No personnel records found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ══ REGISTRATION MODAL ═════════════════════════════════════ */}
            {isRegModalOpen && (
                <div className="modal active">
                    <div className="modal-content bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto relative border border-slate-200">
                        {/* Modal Header */}
                        <div className="bg-blue-600 text-white p-6 rounded-t-2xl sticky top-0 z-10">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-blue-200 text-[11px] font-semibold uppercase tracking-wider mb-1">
                                        {editingId ? "Edit Profile" : "New Registration"}
                                    </p>
                                    <h2 className="text-lg font-bold">{editingId ? "Edit Volunteer Profile" : "Volunteer Registration"}</h2>
                                </div>
                                <button type="button" onClick={() => setIsRegModalOpen(false)}
                                    className="w-9 h-9 flex items-center justify-center bg-white/15 hover:bg-white/25 rounded-xl transition text-white">
                                    <i className="fas fa-times" />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleRegisterSubmit} className="p-6">
                            {/* Role Selection */}
                            <div className="mb-6">
                                <label className={labelCls}>Register as</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button type="button" onClick={() => setRole('individual')}
                                        className={`p-4 border-2 rounded-xl transition text-center ${role === 'individual' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-blue-300 text-slate-600'}`}>
                                        <i className="fas fa-user text-2xl mb-2 block" />
                                        <p className="font-semibold text-sm">Individual</p>
                                    </button>
                                    <button type="button" onClick={() => setRole('team')}
                                        className={`p-4 border-2 rounded-xl transition text-center ${role === 'team' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 hover:border-teal-300 text-slate-600'}`}>
                                        <i className="fas fa-users text-2xl mb-2 block" />
                                        <p className="font-semibold text-sm">Team</p>
                                    </button>
                                </div>
                            </div>

                            {/* Name + Contact */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className={labelCls}>Name <span className="text-rose-500">*</span></label>
                                    <input type="text" value={name} onChange={e => handleFieldChange('name', e.target.value, setName)} onBlur={() => handleFieldBlur('name', name)}
                                        className={inputCls(formErrors.name, formTouched.name, name)} placeholder="Enter name (letters only)" maxLength={50} />
                                    {formErrors.name && formTouched.name && <p className="mt-1 text-xs text-rose-500 flex items-center gap-1"><i className="fas fa-exclamation-circle" />{formErrors.name}</p>}
                                </div>
                                <div>
                                    <label className={labelCls}>Contact <span className="text-rose-500">*</span></label>
                                    <input type="tel" value={contact} onChange={e => handleFieldChange('contact', e.target.value, setContact)} onBlur={() => handleFieldBlur('contact', contact)}
                                        className={inputCls(formErrors.contact, formTouched.contact, contact)} placeholder="Phone number" />
                                    {formErrors.contact && formTouched.contact && <p className="mt-1 text-xs text-rose-500 flex items-center gap-1"><i className="fas fa-exclamation-circle" />{formErrors.contact}</p>}
                                </div>
                            </div>

                            {/* Team Size */}
                            {role === 'team' && (
                                <div className="mb-6">
                                    <label className={labelCls}>Number of Team Members <span className="text-rose-500">*</span></label>
                                    <input type="number" min="2" max="100" value={teamSize} onChange={e => handleFieldChange('teamSize', e.target.value, setTeamSize)} onBlur={() => handleFieldBlur('teamSize', teamSize)}
                                        className={inputCls(formErrors.teamSize, formTouched.teamSize, teamSize)} placeholder="Enter team size (2–100)" />
                                    {formErrors.teamSize && formTouched.teamSize && <p className="mt-1 text-xs text-rose-500 flex items-center gap-1"><i className="fas fa-exclamation-circle" />{formErrors.teamSize}</p>}
                                </div>
                            )}

                            {/* Profile Picture */}
                            <div className="mb-6">
                                <label className={labelCls}>Profile Picture</label>
                                <div className="drag-drop-zone rounded-xl p-8 text-center cursor-pointer relative">
                                    <i className="fas fa-cloud-upload-alt text-3xl text-slate-300 mb-2 block" />
                                    <p className="text-slate-500 text-sm">Click to browse image</p>
                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                </div>
                                {profilePicture && <div className="mt-4"><img src={profilePicture} alt="Preview" className="w-28 h-28 object-cover rounded-xl mx-auto border border-slate-200" /></div>}
                            </div>

                            {/* Description */}
                            <div className="mb-6">
                                <label className={labelCls}>Description / Introduction</label>
                                <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition resize-none"
                                    placeholder="Tell us about yourself..." />
                            </div>

                            {/* Skills */}
                            <div className="mb-6">
                                <label className={labelCls}>Skills &amp; Special Equipment</label>
                                {selectedSkills.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {selectedSkills.map(s => (
                                            <span key={s} className="skill-tag bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5">
                                                {s}
                                                <button type="button" onClick={() => toggleSkill(s)} className="text-blue-400 hover:text-blue-600">
                                                    <i className="fas fa-times text-[10px]" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {['First Aid','Water Safety / Lifeguard','Boat Handling','Waste Sorting & Recycling','Environmental Awareness','Logistics & Coordination','Team Support','Heavy Lifting'].map(skill => (
                                        <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                                            className={`px-3 py-2 border rounded-lg text-xs font-medium transition ${selectedSkills.includes(skill) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50'}`}>
                                            {skill}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Location */}
                            <div className="mb-6 border-t border-slate-100 pt-6">
                                <h3 className="text-base font-bold text-slate-800 mb-1">Your Location <span className="text-rose-500">*</span></h3>
                                <p className="text-xs text-slate-400 mb-6">Help us find the cleaning zone closest to where you live.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className={labelCls}>City / Town <span className="text-rose-500">*</span></label>
                                        <input type="text" value={city} onChange={e => handleFieldChange('city', e.target.value, setCity)} onBlur={() => handleFieldBlur('city', city)}
                                            className={inputCls(formErrors.city, formTouched.city, city)} placeholder="Enter your city..." />
                                        {formErrors.city && formTouched.city && <p className="mt-1 text-xs text-rose-500 flex items-center gap-1"><i className="fas fa-exclamation-circle" />{formErrors.city}</p>}
                                    </div>
                                    <div>
                                        <label className={labelCls}>Postal Code (Optional)</label>
                                        <input type="text" value={postalCode} onChange={e => handleFieldChange('postalCode', e.target.value, setPostalCode)} onBlur={() => handleFieldBlur('postalCode', postalCode)}
                                            className={inputCls(formErrors.postalCode, formTouched.postalCode, postalCode)} placeholder="e.g. 10100" />
                                        {formErrors.postalCode && formTouched.postalCode && <p className="mt-1 text-xs text-rose-500 flex items-center gap-1"><i className="fas fa-exclamation-circle" />{formErrors.postalCode}</p>}
                                    </div>
                                </div>
                                <div>
                                    <label className={labelCls}>Travel Distance</label>
                                    <div className="flex items-center gap-4 mt-1">
                                        <span className="text-xs text-slate-400 whitespace-nowrap">1 km</span>
                                        <input type="range" min="1" max="30" value={travelDistance} onChange={e => setTravelDistance(e.target.value)}
                                            className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                                        <span className="text-xs text-slate-400 whitespace-nowrap">30 km</span>
                                        <span className="bg-blue-50 border border-blue-100 text-blue-700 font-semibold px-3 py-1 rounded-lg text-xs whitespace-nowrap">{travelDistance} km</span>
                                    </div>
                                </div>
                            </div>

                            {/* Availability */}
                            <div className="mb-6 border-t border-slate-100 pt-6">
                                <h3 className="text-base font-bold text-slate-800 mb-1">When are you available?</h3>
                                <p className="text-xs text-slate-400 mb-6">Select all that apply — we'll schedule based on your availability and zone.</p>

                                <div className="mb-6">
                                    <label className={labelCls}>Select Dates</label>
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <button type="button" onClick={prevMonth} className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-white text-slate-500 transition"><i className="fas fa-chevron-left text-xs" /></button>
                                            <h4 className="font-semibold text-sm text-slate-800">{currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h4>
                                            <button type="button" onClick={nextMonth} className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-white text-slate-500 transition"><i className="fas fa-chevron-right text-xs" /></button>
                                        </div>
                                        <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                                            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                                                <div key={d} className="text-[10px] font-semibold text-slate-400 uppercase">{d}</div>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-7 gap-1">{renderCalendarDays()}</div>
                                    </div>
                                </div>

                                <div>
                                    <label className={labelCls}>Time Preference</label>
                                    <div className="flex flex-wrap gap-3">
                                        {[{ id:'Morning', label:'Morning (6–10 AM)' },{ id:'Midday', label:'Midday (10–2 PM)' },{ id:'Afternoon', label:'Afternoon (2–6 PM)' }].map(time => (
                                            <button key={time.id} type="button" onClick={() => toggleTime(time.id)}
                                                className={`px-5 py-2.5 border rounded-xl text-sm font-medium transition ${selectedTimes.includes(time.id) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-blue-300'}`}>
                                                {time.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-sm transition shadow-sm">
                                    <i className="fas fa-check-circle mr-2" />{editingId ? "Update Profile" : "Register"}
                                </button>
                                <button type="button" onClick={() => setIsRegModalOpen(false)}
                                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-semibold text-sm transition">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ══ DETAILS MODAL ══════════════════════════════════════════ */}
            {isDetailsOpen && selectedVolunteer && (
                <div className="modal active">
                    <div className={`modal-content ${currentView === 'admin' ? 'bg-[#111827] border-[#1f2937]' : 'bg-white border-slate-200'} rounded-3xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto border`}>
                        {/* Header */}
                        <div className={`${currentView === 'admin' ? 'bg-[#0f172a] border-b border-[#1f2937]' : 'bg-blue-600'} text-white p-8 sticky top-0 z-10`}>
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-6">
                                    <div className="relative">
                                        <img src={selectedVolunteer.profilePicture} alt="Profile" className="w-20 h-20 rounded-2xl border-2 border-[#334155] object-cover shadow-xl" />
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-4 border-[#111827]" />
                                    </div>
                                    <div>
                                        <h2 className={`text-2xl font-black ${currentView === 'admin' ? 'text-white' : 'text-white'} tracking-tight`}>{selectedVolunteer.name}</h2>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`inline-block px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-widest ${currentView === 'admin' ? 'bg-[#134e4a] text-[#2dd4bf]' : 'bg-white/20 text-white'}`}>
                                                {selectedVolunteer.role === 'team' ? 'TEAM UNIT' : 'INDIVIDUAL'}
                                            </span>
                                            {selectedVolunteer.role === 'team' && (
                                                <span className={`inline-block px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-widest ${currentView === 'admin' ? 'bg-[#1e293b] text-[#94a3b8]' : 'bg-white/10 text-white'}`}>
                                                    {selectedVolunteer.teamSize} MEMBERS
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button type="button" onClick={() => setIsDetailsOpen(false)}
                                    className={`w-10 h-10 flex items-center justify-center ${currentView === 'admin' ? 'bg-[#1e293b] hover:bg-[#334155]' : 'bg-white/10 hover:bg-white/20'} rounded-2xl transition-all text-white self-start`}>
                                    <i className="fas fa-times" />
                                </button>
                            </div>
                        </div>

                        <div className="p-8 space-y-8">
                            <div>
                                <h3 className={`text-[11px] font-bold ${currentView === 'admin' ? 'text-[#475569]' : 'text-slate-400'} uppercase tracking-[0.2em] mb-3 flex items-center gap-3`}>
                                    <i className={`fas fa-phone ${currentView === 'admin' ? 'text-[#2dd4bf]' : 'text-blue-500'}`} /> CONTACT PROTOCOL
                                </h3>
                                <p className={`text-lg font-bold ${currentView === 'admin' ? 'text-white' : 'text-slate-800'}`}>{selectedVolunteer.contact}</p>
                            </div>
                            {selectedVolunteer.description && (
                                <div>
                                    <h3 className={`text-[11px] font-bold ${currentView === 'admin' ? 'text-[#475569]' : 'text-slate-400'} uppercase tracking-[0.2em] mb-3 flex items-center gap-3`}>
                                        <i className={`fas fa-info-circle ${currentView === 'admin' ? 'text-[#2dd4bf]' : 'text-blue-500'}`} /> BRIEFING / BIO
                                    </h3>
                                    <p className={`text-base font-medium leading-relaxed ${currentView === 'admin' ? 'text-[#94a3b8]' : 'text-slate-700'}`}>{selectedVolunteer.description}</p>
                                </div>
                            )}
                            {selectedVolunteer.skills?.length > 0 && (
                                <div>
                                    <h3 className={`text-[11px] font-bold ${currentView === 'admin' ? 'text-[#475569]' : 'text-slate-400'} uppercase tracking-[0.2em] mb-4 flex items-center gap-3`}>
                                        <i className={`fas fa-tools ${currentView === 'admin' ? 'text-[#2dd4bf]' : 'text-blue-500'}`} /> CERTIFIED CAPABILITIES
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedVolunteer.skills.map(s => (
                                            <span key={s} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border ${currentView === 'admin' ? 'bg-[#1e293b] text-[#2dd4bf] border-[#134e4a]' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>{s}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div>
                                <h3 className={`text-[11px] font-bold ${currentView === 'admin' ? 'text-[#475569]' : 'text-slate-400'} uppercase tracking-[0.2em] mb-4 flex items-center gap-3`}>
                                    <i className={`fas fa-calendar-alt ${currentView === 'admin' ? 'text-[#2dd4bf]' : 'text-blue-500'}`} /> OPERATIONS AVAILABILITY
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedVolunteer.availabilityDates?.map(d => (
                                        <span key={d} className={`px-4 py-2 rounded-xl text-xs font-bold border ${currentView === 'admin' ? 'bg-[#0f172a] text-[#94a3b8] border-[#1f2937]' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>{d}</span>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Delete Action (Admins or Owner only) */}
                            {(isAdmin() || (selectedVolunteer.userId === (user?.id || user?._id))) && (
                                <div className="mt-12 pt-8 border-t border-[#1f2937]">
                                    <button onClick={() => handleDelete(selectedVolunteer._id || selectedVolunteer.id)}
                                        className="w-full bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all border border-rose-500/20 group">
                                        <i className="fas fa-trash-alt mr-2 group-hover:shake" /> Delete Personnel Record
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ══ ASSIGN TASK MODAL ══════════════════════════════════════ */}
            {isAssignTaskOpen && assignTarget && (
                <div className="modal active">
                    <div className="modal-content bg-[#111827] rounded-3xl shadow-2xl max-w-2xl w-full mx-4 border border-[#1f2937]">
                        <div className="bg-[#0f172a] p-8 rounded-t-3xl border-b border-[#1f2937]">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-[#2dd4bf] text-[11px] font-bold uppercase tracking-[0.2em] mb-2">Task Allocation</p>
                                    <h2 className="text-xl font-black text-white tracking-tight">Assign Clean-up Objective</h2>
                                </div>
                                <button onClick={() => setIsAssignTaskOpen(false)}
                                    className="w-10 h-10 flex items-center justify-center bg-[#1e293b] hover:bg-[#334155] rounded-2xl transition-all text-white">
                                    <i className="fas fa-times" />
                                </button>
                            </div>
                        </div>
                        <form onSubmit={e => { e.preventDefault(); showNotification(`Objective assigned to ${assignTarget.name}`, 'success'); setIsAssignTaskOpen(false); }} className="p-8">
                            <div className="mb-8">
                                <label className="block text-[11px] font-bold text-[#475569] uppercase tracking-[0.2em] mb-3">Objective Designation <span className="text-rose-500">*</span></label>
                                <input type="text" required placeholder="e.g., DEBRIS EXTRACTION ALPHA"
                                    className="w-full px-5 py-4 border border-[#1f2937] bg-[#0f172a] rounded-2xl text-sm font-bold text-white placeholder:text-[#334155] focus:outline-none focus:ring-2 focus:ring-[#2dd4bf]/20 focus:border-[#2dd4bf] transition-all uppercase tracking-widest" />
                                <p className="mt-3 text-[10px] text-[#475569] font-bold uppercase tracking-wider">Assigned to: {assignTarget.name} ({assignTarget.role})</p>
                            </div>
                            <div className="flex gap-4">
                                <button type="submit" className="flex-1 bg-[#2dd4bf] hover:bg-[#14b8a6] text-black py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all transform active:scale-[0.98] shadow-lg shadow-[#2dd4bf]/10">
                                    Initialize Assignment
                                </button>
                                <button type="button" onClick={() => setIsAssignTaskOpen(false)}
                                    className="px-8 py-4 bg-[#1e293b] hover:bg-[#334155] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all">
                                    Abort
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VolunteerHub;
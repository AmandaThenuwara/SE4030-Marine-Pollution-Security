import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Calendar, Award, Target, Star, Medal, User, Zap, ChevronRight, ArrowRight, Upload, CheckCircle, XCircle, Image as ImageIcon, X, AlertCircle, Sparkles } from 'lucide-react';
import achievementService from '../services/achievementService';
import Badge from '../components/Badge';
import { useAuth } from '../context/AuthContext';

/* ─── Toast ─────────────────────────────────────────────────────────── */
const Toast = ({ message, type, onClose }) => (
  <div
    className={`fixed top-24 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg text-white transition-all animate-slide-in ${
      type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
    }`}
  >
    {type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
    <span className="text-sm font-semibold">{message}</span>
    <button onClick={onClose} className="ml-4 opacity-60 hover:opacity-100 transition-opacity">
      <X size={14} />
    </button>
  </div>
);

/* ─── Stat Card ──────────────────────────────────────────────────────── */
const StatCard = ({ label, value, icon, accentColor }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-start gap-4 hover:shadow-md transition-shadow">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${accentColor}`}>
      {icon}
    </div>
    <div>
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{value ?? '—'}</p>
    </div>
  </div>
);

/* ─── Badge Tile ─────────────────────────────────────────────────────── */
const BadgeTile = ({ type, count, colorClass }) => (
  <div
    className={`rounded-xl border p-4 text-center transition-opacity ${
      count > 0 ? colorClass : 'border-slate-100 bg-slate-50 opacity-40'
    }`}
  >
    <p className="text-2xl font-bold tabular-nums text-slate-800">{count ?? 0}</p>
    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mt-1">{type}</p>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════
   MyAchievements Page
═══════════════════════════════════════════════════════════════════════ */
const MyAchievements = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [volunteerStats, setVolunteerStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [toast, setToast] = useState(null);
  const [submitData, setSubmitData] = useState({ activityTitle: '', description: '', evidenceImage: null });
  const [imagePreview, setImagePreview] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});

  /* ── Toast helper ── */
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  /* ── Image handler ── */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast('Image size should be less than 5MB', 'error'); return; }
    setSubmitData({ ...submitData, evidenceImage: file });
    setImagePreview(URL.createObjectURL(file));
  };

  /* ── Validation ── */
  const validateField = (name, value) => {
    switch (name) {
      case 'activityTitle':
        if (!value?.trim()) return 'Activity title is required';
        if (value.trim().length < 3) return 'Title must be at least 3 characters';
        if (value.trim().length > 100) return 'Title must be less than 100 characters';
        if (!/^[a-zA-Z0-9\s\-.,!?()]+$/.test(value.trim())) return 'Title contains invalid characters';
        return '';
      case 'description':
        if (!value?.trim()) return 'Description is required';
        if (value.trim().length < 10) return 'Description must be at least 10 characters';
        if (value.trim().length > 500) return 'Description must be less than 500 characters';
        return '';
      default: return '';
    }
  };

  const handleFieldChange = (field, value) => {
    setSubmitData({ ...submitData, [field]: value });
    if (touched[field]) setFormErrors(prev => ({ ...prev, [field]: validateField(field, value) }));
  };

  const handleFieldBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setFormErrors(prev => ({ ...prev, [field]: validateField(field, submitData[field]) }));
  };

  const validateForm = () => {
    const errors = {
      activityTitle: validateField('activityTitle', submitData.activityTitle),
      description: validateField('description', submitData.description),
    };
    setFormErrors(errors);
    setTouched({ activityTitle: true, description: true });
    return !errors.activityTitle && !errors.description;
  };

  /* ── Data fetching ── */
  const fetchMyAchievements = async () => {
    try {
      setLoading(true);
      const response = await achievementService.getMyAchievements({ page: currentPage, limit: 10 });
      setAchievements(response.data || []);
      setVolunteerStats(response.volunteerStats || null);
      setPagination(response.pagination || {});
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch personal impact data');
    } finally {
      setLoading(false);
    }
  };

  /* ── Submit achievement ── */
  const handleSubmitAchievement = async (e) => {
    e.preventDefault();
    if (!validateForm()) { showToast('Please fix the form errors', 'error'); return; }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('activityTitle', submitData.activityTitle);
      formData.append('description', submitData.description);
      if (submitData.evidenceImage) formData.append('evidenceImage', submitData.evidenceImage);
      await achievementService.submitAchievement(formData);
      showToast('Achievement submitted successfully! Pending admin approval.');
      setShowSubmitForm(false);
      setSubmitData({ activityTitle: '', description: '', evidenceImage: null });
      setImagePreview(null);
      setFormErrors({});
      setTouched({});
      fetchMyAchievements();
    } catch (err) {
      showToast(err.message || 'Failed to submit achievement', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyAchievements(); }, [currentPage]);

  /* ── Progress helpers ── */
  const getNextLevelProgress = () => {
    if (!volunteerStats) return 0;
    const p = volunteerStats.totalPoints;
    if (p >= 750) return 100;
    if (p >= 250) return ((p - 250) / 500) * 100;
    return (p / 250) * 100;
  };

  const getNextLevelName = () => {
    if (!volunteerStats) return 'Intermediate';
    return volunteerStats.currentLevel === 'Advanced' ? 'Max Rank'
      : volunteerStats.currentLevel === 'Intermediate' ? 'Advanced' : 'Intermediate';
  };

  const getNextLevelPoints = () => {
    if (!volunteerStats) return 0;
    const p = volunteerStats.totalPoints;
    if (p >= 750) return 0;
    return (p >= 250 ? 750 : 250) - p;
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  /* ── Loading state ── */
  if (loading && achievements.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Loading Profile</p>
        </div>
      </div>
    );
  }

  /* ═══ RENDER ═══════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(155deg, #0a1628 0%, #0f2444 35%, #162d4a 70%, #1a3a5c 100%)',
        paddingTop: '120px',
        paddingBottom: '80px',
        paddingLeft: '24px',
        paddingRight: '24px',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        {/* Background light blobs */}
        <div style={{
          position: 'absolute', top: '-60px', right: '-60px',
          width: '320px', height: '320px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)', filter: 'blur(60px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-40px', left: '-40px',
          width: '240px', height: '240px', borderRadius: '50%',
          background: 'rgba(59,130,246,0.12)', filter: 'blur(80px)',
        }} />

        <div style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Badge pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            padding: '6px 16px', borderRadius: '999px',
            background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.3)',
            color: '#38bdf8', fontSize: '11px', letterSpacing: '0.12em',
            textTransform: 'uppercase', marginBottom: '24px',
          }}>
            <Sparkles size={12} />
            Your Impact Profile
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 500,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            margin: '0 0 16px',
            textTransform: 'capitalize'
          }}>
            {user?.name?.split(' ')[0] || 'Ocean'}{' '}
            <span style={{
              background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              {user?.name?.split(' ').slice(1).join(' ') || 'Warrior'}
            </span>
          </h1>

          <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.7, maxWidth: '540px', margin: '0 auto 32px', fontWeight: 400 }}>
            Tracking your personal contribution to marine conservation and celebrating your accomplishments.
          </p>

          <button
            onClick={() => setShowSubmitForm(true)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-semibold text-sm shadow-lg shadow-blue-900/40 transition-all hover:-translate-y-0.5 active:scale-95"
          >
            <Upload size={16} />
            Submit Achievement
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-10">
        {/* ── Stat Cards ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <StatCard
            label="Total Points"
            value={volunteerStats?.totalPoints?.toLocaleString()}
            icon={<Trophy size={20} className="text-amber-600" />}
            accentColor="bg-amber-50"
          />
          <StatCard
            label="Missions Complete"
            value={volunteerStats?.achievementsCount}
            icon={<Zap size={20} className="text-blue-600" />}
            accentColor="bg-blue-50"
          />
          <StatCard
            label="Tier Rank"
            value={volunteerStats?.currentLevel}
            icon={<Target size={20} className="text-indigo-600" />}
            accentColor="bg-indigo-50"
          />
          <StatCard
            label="Global Standing"
            value="Top 5%"
            icon={<TrendingUp size={20} className="text-emerald-600" />}
            accentColor="bg-emerald-50"
          />
        </div>

        {/* ── Main Grid ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Mission History ─────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Mission History</h2>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {pagination.total || 0} Records
              </span>
            </div>

            {achievements.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
                <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5 text-slate-300">
                  <Target size={28} />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-2">No missions yet</h3>
                <p className="text-slate-500 text-sm">
                  Join a local cleanup event to earn your first recognition.
                </p>
              </div>
            ) : (
              achievements.map((a, i) => (
                <div
                  key={a._id}
                  className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md hover:border-slate-300 transition-all"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  {/* Row 1 – status badges + date */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                    <div className="flex items-center gap-2 flex-wrap">
                      {a.status === 'approved' && <Badge type={a.badgeType} size="sm" />}
                      {a.status === 'pending' && (
                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-amber-50 text-amber-700 border border-amber-100">
                          Pending Review
                        </span>
                      )}
                      {a.status === 'rejected' && (
                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-rose-50 text-rose-700 border border-rose-100">
                          Rejected
                        </span>
                      )}
                      {a.status === 'approved' && (
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${
                          a.level === 'Advanced'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                            : a.level === 'Intermediate'
                            ? 'bg-blue-50 text-blue-700 border-blue-100'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        }`}>
                          {a.level}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                      <Calendar size={13} />
                      {formatDate(a.createdAt)}
                    </div>
                  </div>

                  {/* Row 2 – title + points */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-slate-800 mb-1 hover:text-blue-600 transition-colors">
                        {a.activityTitle}
                      </h3>
                      <p className="text-sm text-slate-500 leading-relaxed max-w-xl">{a.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      {a.status === 'approved' ? (
                        <>
                          <p className="text-2xl font-bold text-slate-800 tabular-nums">+{a.pointsAwarded?.toLocaleString()}</p>
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Points Granted</p>
                        </>
                      ) : a.status === 'pending' ? (
                        <>
                          <p className="text-xl font-bold text-amber-600">Pending</p>
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Under Review</p>
                        </>
                      ) : (
                        <>
                          <p className="text-xl font-bold text-rose-600">Rejected</p>
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Not Approved</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-300 disabled:opacity-30 transition-all text-sm font-bold"
                >
                  ←
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(pagination.pages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                        currentPage === i + 1
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600'
                      }`}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, pagination.pages))}
                  disabled={currentPage === pagination.pages}
                  className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-300 disabled:opacity-30 transition-all text-sm font-bold"
                >
                  →
                </button>
              </div>
            )}
          </div>

          {/* ── Sidebar ─────────────────────────────────────────────── */}
          <div className="space-y-6">

            {/* Progression Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-7">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-600 mb-6">
                Progression Path
              </p>
              <div className="flex justify-between items-end mb-4">
                <div>
                  <p className="text-xs font-medium text-slate-400 mb-0.5">Current Tier</p>
                  <p className="text-lg font-bold text-slate-800">{volunteerStats?.currentLevel}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-400 mb-0.5">Target Rank</p>
                  <p className="text-lg font-bold text-blue-600">{getNextLevelName()}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 mb-3 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-700"
                  style={{ width: `${getNextLevelProgress()}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400 font-medium">{getNextLevelPoints()} pts remaining</p>
                <ArrowRight size={15} className="text-blue-500" />
              </div>
            </div>

            {/* Badge Collection */}
            <div className="bg-white border border-slate-200 rounded-2xl p-7">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-5">
                Authorized Badges
              </p>
              <div className="grid grid-cols-3 gap-3">
                <BadgeTile
                  type="Gold"
                  count={volunteerStats?.goldBadges}
                  colorClass="border-amber-200 bg-amber-50"
                />
                <BadgeTile
                  type="Silver"
                  count={volunteerStats?.silverBadges}
                  colorClass="border-slate-200 bg-slate-50"
                />
                <BadgeTile
                  type="Bronze"
                  count={volunteerStats?.bronzeBadges}
                  colorClass="border-orange-200 bg-orange-50"
                />
              </div>
            </div>

            {/* Ambassador Notice */}
            <div className="bg-white border border-slate-200 rounded-2xl p-7 flex items-start gap-4">
              <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                <Medal size={22} className="text-indigo-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">Ocean Ambassador</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  You are among the top contributors in your region. Keep up the high-impact work!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Submit Achievement Modal ───────────────────────────────────── */}
      {showSubmitForm && (
        <div className="fixed inset-0 z-[200] overflow-y-auto bg-black/40 animate-fade-in">
          <div className="min-h-screen flex items-center justify-center p-4 py-12">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">

              {/* Modal Header */}
              <div className="bg-blue-600 px-6 py-5 flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-[11px] font-semibold uppercase tracking-wider mb-1">
                    Achievement Submission
                  </p>
                  <h2 className="text-lg font-bold text-white">Submit Your Achievement</h2>
                </div>
                <button
                  onClick={() => { setShowSubmitForm(false); setFormErrors({}); setTouched({}); }}
                  className="w-9 h-9 flex items-center justify-center bg-white/15 text-white hover:bg-white/25 rounded-xl transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <p className="text-slate-500 text-sm mb-6">
                  Share your conservation efforts with the community. Admin will review and assign points.
                </p>

                <form onSubmit={handleSubmitAchievement} className="space-y-5">

                  {/* Activity Title */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Activity Title <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={submitData.activityTitle}
                        onChange={(e) => handleFieldChange('activityTitle', e.target.value)}
                        onBlur={() => handleFieldBlur('activityTitle')}
                        className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 transition-all focus:outline-none focus:bg-white ${
                          formErrors.activityTitle && touched.activityTitle
                            ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                            : touched.activityTitle && !formErrors.activityTitle && submitData.activityTitle
                            ? 'border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
                            : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                        }`}
                        placeholder="e.g., Beach Cleanup at Santa Monica"
                        maxLength={100}
                      />
                      {touched.activityTitle && !formErrors.activityTitle && submitData.activityTitle && (
                        <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
                      )}
                    </div>
                    <div className="flex justify-between mt-1.5">
                      {formErrors.activityTitle && touched.activityTitle ? (
                        <p className="text-xs text-rose-500 flex items-center gap-1">
                          <AlertCircle size={12} /> {formErrors.activityTitle}
                        </p>
                      ) : <span />}
                      <span className="text-xs text-slate-400">{submitData.activityTitle.length}/100</span>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Description <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={submitData.description}
                      onChange={(e) => handleFieldChange('description', e.target.value)}
                      onBlur={() => handleFieldBlur('description')}
                      className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 transition-all focus:outline-none focus:bg-white resize-none ${
                        formErrors.description && touched.description
                          ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                          : touched.description && !formErrors.description && submitData.description
                          ? 'border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
                          : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                      }`}
                      placeholder="Describe your conservation effort and its impact..."
                      maxLength={500}
                    />
                    <div className="flex justify-between mt-1.5">
                      {formErrors.description && touched.description ? (
                        <p className="text-xs text-rose-500 flex items-center gap-1">
                          <AlertCircle size={12} /> {formErrors.description}
                        </p>
                      ) : <span />}
                      <span className="text-xs text-slate-400">{submitData.description.length}/500</span>
                    </div>
                  </div>

                  {/* Evidence Image */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Evidence Image <span className="text-slate-400 normal-case font-normal">(Optional)</span>
                    </label>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="evidenceImage" />
                    <label
                      htmlFor="evidenceImage"
                      className="flex items-center justify-center w-full px-4 py-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 hover:border-blue-400 transition-all"
                    >
                      <ImageIcon size={16} className="mr-2 text-slate-400" />
                      <span className="text-sm font-medium text-slate-500">
                        {submitData.evidenceImage ? submitData.evidenceImage.name : 'Click to upload image (Max 5MB)'}
                      </span>
                    </label>
                    {imagePreview && (
                      <div className="mt-3 relative inline-block">
                        <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-xl border border-slate-200" />
                        <button
                          type="button"
                          onClick={() => { setSubmitData({ ...submitData, evidenceImage: null }); setImagePreview(null); }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 transition-all"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Upload size={16} />
                          Submit for Review
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowSubmitForm(false); setFormErrors({}); setTouched({}); }}
                      className="px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-xl font-semibold text-sm transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAchievements;

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Search, TrendingUp, Users, Award, CheckCircle, XCircle, Trophy, Filter, LayoutGrid, List, Image as ImageIcon } from 'lucide-react';
import achievementService from '../services/achievementService';
import api from '../services/api';
import Badge from '../components/Badge';
import AchievementForm from '../components/AchievementForm';

// Toast notification
const Toast = ({ message, type, onClose }) => (
  <div
    className={`fixed top-24 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-lg shadow-lg text-white transition-all animate-slide-in ${
      type === 'success' ? 'bg-teal-600' : 'bg-red-600'
    }`}
  >
    {type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
    <span className="text-sm font-semibold">{message}</span>
    <button onClick={onClose} className="ml-3 opacity-60 hover:opacity-100 transition-opacity text-white">✕</button>
  </div>
);

const LEVEL_COLORS = {
  Advanced: 'bg-teal-900/60 text-teal-300 border-teal-700',
  Intermediate: 'bg-blue-900/60 text-blue-300 border-blue-700',
  Beginner: 'bg-slate-700 text-slate-300 border-slate-600',
};

const AchievementHub = () => {
  const [achievements, setAchievements] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBadge, setFilterBadge] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAchievements = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...(filterBadge && { badgeType: filterBadge }),
        ...(filterLevel && { level: filterLevel }),
        ...(filterStatus && { status: filterStatus }),
      };
      const response = await achievementService.getAllAchievements(params);
      setAchievements(response.data || []);
      setPagination(response.pagination || {});
    } catch (err) {
      showToast(err.message || 'Failed to fetch achievements', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterBadge, filterLevel, filterStatus]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await achievementService.getAchievementStats();
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  const fetchVolunteers = useCallback(async () => {
    try {
      const response = await api.get('/volunteers');
      setVolunteers(Array.isArray(response) ? response : (response.data || []));
    } catch (err) {
      console.error('Failed to fetch volunteers:', err);
    }
  }, []);

  useEffect(() => {
    fetchAchievements();
    fetchStats();
    fetchVolunteers();
  }, [fetchAchievements, fetchStats, fetchVolunteers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterBadge, filterLevel, filterStatus, searchTerm]);

  const handleCreate = async (data) => {
    try {
      setActionLoading(true);
      await achievementService.createAchievement(data);
      setShowForm(false);
      showToast('Achievement created successfully!');
      fetchAchievements();
      fetchStats();
    } catch (err) {
      showToast(err.message || 'Failed to create achievement', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (data) => {
    try {
      setActionLoading(true);
      await achievementService.updateAchievement(editingAchievement._id, data);
      setEditingAchievement(null);
      showToast('Achievement updated successfully!');
      fetchAchievements();
      fetchStats();
    } catch (err) {
      showToast(err.message || 'Failed to update achievement', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (id, volunteerName) => {
    const points = prompt(`Assign points for ${volunteerName}'s achievement (0-10000):`);
    if (!points) return;
    const pointsNum = parseInt(points);
    if (isNaN(pointsNum) || pointsNum < 0 || pointsNum > 10000) {
      showToast('Invalid points value', 'error');
      return;
    }
    try {
      await achievementService.approveAchievement(id, { pointsAwarded: pointsNum });
      showToast('Achievement approved!');
      fetchAchievements();
      fetchStats();
    } catch (err) {
      showToast(err.message || 'Failed to approve achievement', 'error');
    }
  };

  const handleReject = async (id, volunteerName) => {
    if (!window.confirm(`Reject ${volunteerName}'s achievement submission?`)) return;
    try {
      await achievementService.rejectAchievement(id);
      showToast('Achievement rejected.');
      fetchAchievements();
      fetchStats();
    } catch (err) {
      showToast(err.message || 'Failed to reject achievement', 'error');
    }
  };

  const handleDelete = async (id, volunteerName) => {
    if (!window.confirm(`Permanently delete this achievement for ${volunteerName || 'this volunteer'}?`)) return;
    try {
      await achievementService.deleteAchievement(id);
      showToast('Achievement permanently deleted.');
      fetchAchievements();
      fetchStats();
    } catch (err) {
      showToast(err.message || 'Failed to delete achievement', 'error');
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingAchievement(null);
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const filteredAchievements = achievements.filter((a) => {
    // 1. Status Filter
    if (filterStatus && a.status !== filterStatus) return false;

    // 2. Badge Filter
    if (filterBadge && a.badgeType !== filterBadge) return false;

    // 3. Level Filter
    if (filterLevel && a.level !== filterLevel) return false;

    // 4. Search Filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return (
        a.volunteerId?.name?.toLowerCase().includes(term) ||
        a.activityTitle?.toLowerCase().includes(term) ||
        a.description?.toLowerCase().includes(term)
      );
    }

    return true;
  });

  if (loading && achievements.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-5">
            <div className="absolute inset-0 border-2 border-slate-700 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-teal-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-slate-400 text-sm font-medium tracking-wider uppercase">Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Page Header */}
      <div className="bg-slate-900 border-b border-slate-800 pt-28 pb-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[11px] font-bold uppercase tracking-widest">
                <Award size={12} /> Control Center
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Achievement Hub</h1>
            <p className="text-slate-400 text-sm mt-2 max-w-lg">
              Monitor, manage, and recognize volunteer contributions across all ocean conservation efforts.
            </p>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Achievements', value: stats?.totalAchievements, icon: <LayoutGrid size={20} />, accent: 'text-teal-400', border: 'border-teal-500/20' },
            { label: 'Pending Review', value: stats?.pendingAchievements, icon: <Filter size={20} />, accent: 'text-amber-400', border: 'border-amber-500/20' },
            { label: 'Points Distributed', value: stats?.totalPointsAwarded?.toLocaleString(), icon: <TrendingUp size={20} />, accent: 'text-blue-400', border: 'border-blue-500/20' },
            { label: 'Active Volunteers', value: stats?.uniqueVolunteersCount, icon: <Users size={20} />, accent: 'text-slate-300', border: 'border-slate-600' },
          ].map((card, i) => (
            <div
              key={card.label}
              className={`bg-slate-900 border ${card.border} rounded-xl p-5`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className={`${card.accent} mb-3`}>{card.icon}</div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-1">{card.label}</p>
              <h3 className="text-2xl font-bold text-white tabular-nums">{card.value ?? '—'}</h3>
            </div>
          ))}
        </div>

        {/* Filters Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Search by volunteer, title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Filter */}
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-1 gap-1">
              {[
                { id: '', label: 'All' },
                { id: 'approved', label: 'Approved' },
                { id: 'pending', label: 'Pending' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setFilterStatus(opt.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    filterStatus === opt.id
                      ? 'bg-teal-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Badge Filter */}
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-1 gap-1">
              {[
                { id: '', label: 'All Badges' },
                { id: 'Gold', label: 'Gold' },
                { id: 'Silver', label: 'Silver' },
                { id: 'Bronze', label: 'Bronze' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setFilterBadge(opt.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    filterBadge === opt.id
                      ? 'bg-teal-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Level Select */}
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 transition-colors cursor-pointer"
            >
              <option value="">All Levels</option>
              <option value="Advanced">Advanced</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Beginner">Beginner</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  {['Volunteer', 'Activity & Details', 'Impact Points', 'Recognition', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredAchievements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-24 text-center">
                      <div className="max-w-xs mx-auto">
                        <div className="w-14 h-14 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center mx-auto mb-4">
                          <Search size={24} className="text-slate-600" />
                        </div>
                        <h3 className="text-base font-semibold text-white mb-1">No results found</h3>
                        <p className="text-slate-500 text-sm mb-5">Try adjusting your filters or search terms.</p>
                        <button
                          onClick={() => { setSearchTerm(''); setFilterBadge(''); setFilterLevel(''); }}
                          className="text-teal-400 text-sm font-semibold hover:text-teal-300 transition-colors"
                        >
                          Clear all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAchievements.map((a) => (
                    <tr key={a._id} className="hover:bg-slate-800/50 transition-colors">
                      {/* Volunteer */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {a.volunteerId?.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white">{a.volunteerId?.name || 'Anonymous'}</div>
                            <div className="text-xs text-slate-500">{a.volunteerId?.email || ''}</div>
                          </div>
                        </div>
                      </td>

                      {/* Activity */}
                      <td className="px-6 py-4 max-w-xs">
                        <div className="text-sm font-semibold text-white mb-0.5">{a.activityTitle}</div>
                        <p className="text-xs text-slate-500 line-clamp-1 leading-relaxed mb-1.5">{a.description}</p>
                        {a.evidenceUrl && (
                          <a
                            href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${a.evidenceUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-400 hover:text-teal-300 transition-colors"
                          >
                            <ImageIcon size={11} /> View Evidence
                          </a>
                        )}
                      </td>

                      {/* Points */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-base font-bold text-white tabular-nums">
                            {a.status === 'pending' ? '—' : `+${a.pointsAwarded?.toLocaleString()}`}
                          </span>
                          {a.status === 'approved' && (
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                              Total: {a.totalAccumulatedPoints?.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Recognition */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {a.status === 'approved' && (
                            <>
                              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded border ${LEVEL_COLORS[a.level]}`}>
                                {a.level}
                              </span>
                              <Badge type={a.badgeType} size="sm" />
                            </>
                          )}
                          {a.status === 'pending' && (
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded border bg-amber-950/50 text-amber-400 border-amber-700/50">
                              Awaiting
                            </span>
                          )}
                          {a.status === 'rejected' && (
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded border bg-red-950/50 text-red-400 border-red-800/50">
                              Rejected
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4">
                        <div className="text-xs font-medium text-slate-400">{formatDate(a.createdAt)}</div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          {a.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleApprove(a._id, a.volunteerId?.name)}
                                className="p-2 bg-teal-900/40 border border-teal-700/50 text-teal-400 hover:bg-teal-600 hover:text-white hover:border-teal-600 rounded-lg transition-colors"
                                title="Approve"
                              >
                                <CheckCircle size={15} />
                              </button>
                              <button
                                onClick={() => handleReject(a._id, a.volunteerId?.name)}
                                className="p-2 bg-red-950/40 border border-red-800/50 text-red-400 hover:bg-red-600 hover:text-white hover:border-red-600 rounded-lg transition-colors"
                                title="Reject"
                              >
                                <XCircle size={15} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => setEditingAchievement(a)}
                                className="p-2 bg-slate-800 border border-slate-700 text-slate-400 hover:bg-teal-600 hover:text-white hover:border-teal-600 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit2 size={15} />
                              </button>
                              <button
                                onClick={() => handleDelete(a._id, a.volunteerId?.name)}
                                className="p-2 bg-slate-800 border border-slate-700 text-slate-400 hover:bg-red-600 hover:text-white hover:border-red-600 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-slate-900 border-t border-slate-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs font-medium text-slate-500">
                Showing{' '}
                <span className="text-slate-300">{(currentPage - 1) * 10 + 1}–{Math.min(currentPage * 10, pagination.total)}</span>
                {' '}of{' '}
                <span className="text-slate-300">{pagination.total}</span> records
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-9 h-9 flex items-center justify-center bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:border-slate-500 disabled:opacity-30 disabled:pointer-events-none transition-colors text-sm"
                >
                  ←
                </button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                      currentPage === p
                        ? 'bg-teal-600 text-white border border-teal-600'
                        : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, pagination.pages))}
                  disabled={currentPage === pagination.pages}
                  className="w-9 h-9 flex items-center justify-center bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:border-slate-500 disabled:opacity-30 disabled:pointer-events-none transition-colors text-sm"
                >
                  →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Overlay */}
      {(showForm || editingAchievement) && (
        <div className="fixed inset-0 z-[200] overflow-y-auto bg-black/70 animate-fade-in">
          <div className="min-h-screen flex items-center justify-center p-4 py-12">
            <AchievementForm
              initialData={editingAchievement || {}}
              volunteers={volunteers}
              onSubmit={editingAchievement ? handleUpdate : handleCreate}
              onCancel={closeForm}
              isLoading={actionLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementHub;

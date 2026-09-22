import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Search, TrendingUp, Users, Crown, Filter, ArrowUpRight, Flame, Activity } from 'lucide-react';
import achievementService from '../services/achievementService';
import Badge from '../components/Badge';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBadge, setFilterBadge] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const params = {
        limit: 20,
        skip: currentPage * 20,
        ...(filterBadge && { badgeType: filterBadge }),
        ...(filterLevel && { level: filterLevel }),
      };

      const response = await achievementService.getLeaderboard(params);
      setLeaderboard(response.data || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [currentPage, filterBadge, filterLevel]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown style={{ color: '#f59e0b', fill: '#f59e0b' }} size={26} />;
      case 2:
        return <Trophy style={{ color: '#94a3b8', fill: '#94a3b8' }} size={22} />;
      case 3:
        return <Award style={{ color: '#fb923c', fill: '#fb923c' }} size={20} />;
      default:
        return <span style={{ fontSize: '15px', fontWeight: 500, color: '#cbd5e1' }}>#{rank}</span>;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredLeaderboard = searchTerm.trim()
    ? leaderboard.filter(entry => entry.volunteer?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    : leaderboard;

  if (loading && leaderboard.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '44px', height: '44px', border: '3px solid #e2e8f0',
            borderTopColor: '#0ea5e9', borderRadius: '50%',
            margin: '0 auto 16px', animation: 'spin 0.8s linear infinite'
          }} />
          <p style={{ color: '#94a3b8', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Loading Rankings…
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  const levelStyle = (level) => {
    if (level === 'Advanced') return { background: '#eef2ff', color: '#4f46e5', border: '1px solid #c7d2fe' };
    if (level === 'Intermediate') return { background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' };
    return { background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' };
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: '80px' }}>

      {/* ── Hero Header ── */}
      <div style={{
        background: 'linear-gradient(155deg, #0a1628 0%, #0f2444 35%, #162d4a 70%, #1a3a5c 100%)',
        paddingTop: '120px',
        paddingBottom: '80px',
        paddingLeft: '24px',
        paddingRight: '24px',
        position: 'relative',
        overflow: 'hidden',
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
          background: 'rgba(14,165,233,0.12)', filter: 'blur(80px)',
        }} />

        <div style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Badge pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            padding: '6px 16px', borderRadius: '999px',
            background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)',
            color: '#fbbf24', fontSize: '11px', letterSpacing: '0.12em',
            textTransform: 'uppercase', marginBottom: '24px',
          }}>
            <Flame size={12} />
            Global Competition
          </div>

          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
            fontWeight: 500,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            margin: '0 0 16px',
          }}>
            Impact{' '}
            <span style={{
              background: 'linear-gradient(90deg, #7dd3fc, #a5b4fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Champions
            </span>
          </h1>

          <p style={{ color: '#bae6fd', fontSize: '1rem', lineHeight: 1.7, maxWidth: '540px', margin: '0 auto', fontWeight: 400 }}>
            Celebrating the top ocean warriors whose dedication and efforts are transforming our marine ecosystems.
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>

        {/* ── Top 3 Podium ── */}
        {!searchTerm && filteredLeaderboard.length >= 3 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px',
            alignItems: 'flex-end',
            marginTop: '-40px',
            marginBottom: '40px',
          }}
          className="podium-grid"
          >
            {/* 2nd Place */}
            <div style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '32px 24px',
              textAlign: 'center',
              boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
              border: '1px solid #e2e8f0',
              order: 2,
            }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '18px',
                  background: '#f1f5f9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '26px', fontWeight: 400, color: '#94a3b8',
                  margin: '0 auto',
                }}>
                  {filteredLeaderboard[1]?.volunteer?.name?.charAt(0)}
                </div>
                <div style={{
                  position: 'absolute', bottom: '-6px', right: '-6px',
                  width: '26px', height: '26px', borderRadius: '8px',
                  background: '#e2e8f0', border: '3px solid #fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 400, color: '#64748b',
                }}>
                  2
                </div>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 500, color: '#0f172a', margin: '0 0 4px' }}>
                {filteredLeaderboard[1]?.volunteer?.name}
              </h3>
              <p style={{ fontSize: '20px', fontWeight: 400, color: '#64748b', margin: '0 0 12px', fontVariantNumeric: 'tabular-nums' }}>
                {filteredLeaderboard[1]?.totalPoints?.toLocaleString()}
              </p>
              <Badge type={filteredLeaderboard[1]?.highestBadge} size="sm" />
            </div>

            {/* 1st Place */}
            <div style={{
              background: '#ffffff',
              borderRadius: '28px',
              padding: '36px 28px',
              textAlign: 'center',
              boxShadow: '0 12px 48px rgba(245,158,11,0.14)',
              border: '2px solid #fde68a',
              position: 'relative',
              order: 1,
              marginBottom: '-16px',
            }}>
              <div style={{ position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%)' }}>
                <Crown size={34} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
              </div>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px', marginTop: '12px' }}>
                <div style={{
                  width: '88px', height: '88px', borderRadius: '22px',
                  background: 'linear-gradient(135deg, #fbbf24, #f97316)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '36px', fontWeight: 400, color: '#ffffff',
                  boxShadow: '0 8px 24px rgba(251,191,36,0.35)',
                  margin: '0 auto',
                }}>
                  {filteredLeaderboard[0]?.volunteer?.name?.charAt(0)}
                </div>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 500, color: '#0f172a', margin: '0 0 6px' }}>
                {filteredLeaderboard[0]?.volunteer?.name}
              </h3>
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '28px', fontWeight: 500, color: '#d97706', fontVariantNumeric: 'tabular-nums' }}>
                  {filteredLeaderboard[0]?.totalPoints?.toLocaleString()}
                </span>
                <p style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '2px', fontWeight: 400 }}>
                  Global Impact Points
                </p>
              </div>
              <Badge type={filteredLeaderboard[0]?.highestBadge} size="md" />
            </div>

            {/* 3rd Place */}
            <div style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '32px 24px',
              textAlign: 'center',
              boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
              border: '1px solid #e2e8f0',
              order: 3,
            }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '16px',
                  background: '#fff7ed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '22px', fontWeight: 400, color: '#fb923c',
                  margin: '0 auto',
                }}>
                  {filteredLeaderboard[2]?.volunteer?.name?.charAt(0)}
                </div>
                <div style={{
                  position: 'absolute', bottom: '-6px', right: '-6px',
                  width: '26px', height: '26px', borderRadius: '8px',
                  background: '#ffedd5', border: '3px solid #fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 400, color: '#ea580c',
                }}>
                  3
                </div>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 500, color: '#0f172a', margin: '0 0 4px' }}>
                {filteredLeaderboard[2]?.volunteer?.name}
              </h3>
              <p style={{ fontSize: '20px', fontWeight: 400, color: '#fb923c', margin: '0 0 12px', fontVariantNumeric: 'tabular-nums' }}>
                {filteredLeaderboard[2]?.totalPoints?.toLocaleString()}
              </p>
              <Badge type={filteredLeaderboard[2]?.highestBadge} size="sm" />
            </div>
          </div>
        )}

        {/* ── Main Layout ── */}
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

          {/* ── Left: List ── */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Search & Filter */}
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '14px',
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              marginBottom: '20px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              border: '1px solid #f1f5f9',
            }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
                <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Search warriors…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    paddingLeft: '40px',
                    paddingRight: '16px',
                    paddingTop: '11px',
                    paddingBottom: '11px',
                    borderRadius: '12px',
                    border: '1.5px solid #e2e8f0',
                    background: '#f8fafc',
                    fontSize: '14px',
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontWeight: 400,
                  }}
                  onFocus={e => e.target.style.borderColor = '#0ea5e9'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                style={{
                  padding: '11px 16px',
                  borderRadius: '12px',
                  border: '1.5px solid #e2e8f0',
                  background: '#f8fafc',
                  fontSize: '14px',
                  color: '#475569',
                  outline: 'none',
                  cursor: 'pointer',
                  fontWeight: 400,
                }}
              >
                <option value="">All Tiers</option>
                <option value="Advanced">Advanced</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Beginner">Beginner</option>
              </select>
            </div>

            {/* Entries */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredLeaderboard.map((entry, index) => (
                <div
                  key={entry.volunteerId}
                  style={{
                    background: '#ffffff',
                    borderRadius: '18px',
                    padding: '18px 22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                    transition: 'box-shadow 0.18s, border-color 0.18s',
                    cursor: 'default',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = '0 6px 24px rgba(14,165,233,0.1)';
                    e.currentTarget.style.borderColor = '#bae6fd';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.04)';
                    e.currentTarget.style.borderColor = '#f1f5f9';
                  }}
                >
                  {/* Left: rank + avatar + info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {getRankIcon(index + 1)}
                    </div>

                    <div style={{
                      width: '42px', height: '42px', borderRadius: '12px',
                      background: index === 0 ? 'linear-gradient(135deg,#fbbf24,#f97316)'
                        : index === 1 ? '#f1f5f9'
                          : index === 2 ? '#fff7ed'
                            : '#f8fafc',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '16px', fontWeight: 400,
                      color: index === 0 ? '#fff' : index === 2 ? '#fb923c' : '#64748b',
                      flexShrink: 0,
                    }}>
                      {entry.volunteer?.name?.charAt(0)?.toUpperCase()}
                    </div>

                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: 500, color: '#0f172a', margin: '0 0 3px', lineHeight: 1 }}>
                        {entry.volunteer?.name || 'Anonymous Warrior'}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 400 }}>
                          <Activity size={11} />
                          {entry.achievementsCount} Missions
                        </span>
                        <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#e2e8f0', display: 'inline-block' }} />
                        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 400 }}>
                          {entry.lastAchievement ? formatDate(entry.lastAchievement) : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: points + badge + level */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '18px', fontWeight: 400, color: '#0f172a', margin: 0, fontVariantNumeric: 'tabular-nums' }}>
                        {entry.totalPoints.toLocaleString()}
                      </p>
                      <p style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '2px 0 0', fontWeight: 400 }}>Points</p>
                    </div>

                    <div className="hidden sm:block">
                      <Badge type={entry.highestBadge} size="sm" />
                    </div>

                    <span style={{
                      padding: '5px 12px',
                      fontSize: '11px',
                      fontWeight: 400,
                      borderRadius: '8px',
                      letterSpacing: '0.04em',
                      ...levelStyle(entry.currentLevel),
                    }}>
                      {entry.currentLevel}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            {leaderboard.length >= 20 && (
              <div style={{ paddingTop: '28px', textAlign: 'center' }}>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #e2e8f0',
                    color: '#0369a1',
                    padding: '12px 32px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.18s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f0f9ff'; e.currentTarget.style.borderColor = '#7dd3fc'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                >
                  Load More Rankings
                </button>
              </div>
            )}
          </div>

          {/* ── Right Sidebar ── */}
          <div style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '18px', position: 'sticky', top: '100px' }}>

            {/* Stats card */}
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              border: '1px solid #f1f5f9',
            }}>
              <h4 style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', margin: '0 0 20px' }}>
                Summary Stats
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 400 }}>Global Warriors</span>
                  <span style={{ fontSize: '16px', fontWeight: 400, color: '#0f172a' }}>{leaderboard.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 400 }}>Total Missions</span>
                  <span style={{ fontSize: '16px', fontWeight: 400, color: '#0f172a' }}>
                    {leaderboard.reduce((s, e) => s + e.achievementsCount, 0)}
                  </span>
                </div>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  paddingTop: '16px', borderTop: '1px solid #f1f5f9', marginTop: '4px',
                }}>
                  <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: 400 }}>Total Impact</span>
                  <span style={{ fontSize: '18px', fontWeight: 400, color: '#0369a1' }}>
                    {leaderboard.reduce((s, e) => s + e.totalPoints, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Pro tip card */}
            <div style={{
              background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #0ea5e9 100%)',
              borderRadius: '20px',
              padding: '24px',
              color: '#ffffff',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: '-30px', right: '-30px',
                width: '120px', height: '120px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)',
              }} />
              <h4 style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)', margin: '0 0 10px', position: 'relative', zIndex: 1 }}>
                Pro Tip
              </h4>
              <p style={{ fontSize: '13px', lineHeight: 1.65, color: '#bae6fd', margin: '0 0 20px', fontWeight: 400, position: 'relative', zIndex: 1 }}>
                Achieve 'Advanced' status to unlock exclusive mentoring sessions with our lead marine biologists.
              </p>
              <button
                style={{
                  padding: '9px 20px',
                  background: '#ffffff',
                  color: '#0369a1',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 400,
                  cursor: 'pointer',
                  position: 'relative',
                  zIndex: 1,
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .podium-grid { grid-template-columns: 1fr !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Leaderboard;

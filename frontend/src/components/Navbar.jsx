import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Trophy, Award, Home, User, Menu, X, LogOut, LogIn, Shield, Navigation, ClipboardList } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import pureOceanLogo from '../assets/img/pureocean.png';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin, isLoggedIn } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Home', href: '/', icon: Home, show: !isAdmin() },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy, show: !isAdmin() },
    { name: 'Pollution Map', href: '/dashboard', icon: Navigation, show: isLoggedIn() },
    { name: 'Pollution Reports', href: '/reports-dashboard', icon: ClipboardList, show: isLoggedIn() },
    { name: 'Volunteers', href: '/volunteers', icon: User, show: isLoggedIn() },
    { name: 'Achievement Hub', href: '/achievements', icon: Award, show: isLoggedIn() && isAdmin() },
    { name: 'My Achievements', href: '/my-achievements', icon: Award, show: isLoggedIn() && !isAdmin() },
  ];

  const visibleNav = navigation.filter(i => i.show);
  const isActive = (path) => location.pathname === path;
  const onHome = location.pathname === '/';

  const handleLogout = () => { logout(); navigate('/login'); setIsMenuOpen(false); };

  // Nav is always on a dark surface (aurora or dark glass), so always use white text
  const darkMode = true;

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] py-6 transition-all duration-300">
      <div className="max-w-[fit-content] mx-auto px-6">
        {/* ── Single Unified Navbar Pill ── */}
        <div className="flex items-center gap-4 p-2 rounded-2xl backdrop-blur-3xl border bg-[#0a0f18]/80 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {/* 1. Logo Section */}
          <Link to="/" className="flex items-center gap-3 pl-4 pr-2 group">
            <div className="h-12 w-32 flex items-center justify-start overflow-hidden transition-all group-hover:scale-105">
              <img src={pureOceanLogo} alt="Pure Ocean Logo" className="h-full w-full object-contain object-left" />
            </div>
          </Link>
          {/* Thin vertical separator */}
          <div className="w-[1px] h-8 bg-white/10 hidden md:block" />

          {/* 2. Navigation Links Section */}
          <div className="hidden md:flex items-center gap-1">
            {visibleNav.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-medium transition-all ${active
                    ? 'bg-white text-slate-900 shadow-[0_8px_20px_rgba(255,255,255,0.2)]'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Thin vertical separator */}
          <div className="w-[1px] h-8 bg-white/10 hidden md:block" />

          {/* 3. User / Auth Section */}
          <div className="hidden md:flex items-center gap-3 pr-2">
            {isLoggedIn() ? (
              <div className="flex items-center gap-3">
                {/* User chip */}
                <div className="flex items-center gap-3 p-1 pr-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-default">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg ${isAdmin()
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                    : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                    }`}>
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-[12px] font-bold leading-none text-white">{user?.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {isAdmin() && <Shield size={10} className="text-indigo-400" />}
                      <p className="text-[9px] font-normal uppercase tracking-widest text-white/40">
                        {user?.role}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all active:scale-90"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-slate-900 rounded-2xl text-sm font-bold hover:bg-white/90 hover:shadow-lg transition-all"
              >
                <LogIn size={18} />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile hamburger - integrated into pill */}
          <div className="md:hidden pr-2">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2.5 rounded-xl bg-white/10 border border-white/10 text-white"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-x-4 top-24 z-[101] animate-fade-in">
          <div className="bg-[#0a0a0a]/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden">
            <div className="p-6 space-y-1">
              {visibleNav.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-base font-normal transition-all ${active
                      ? 'bg-white/10 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              <div className="pt-5 mt-3 border-t border-white/10 space-y-3">
                {isLoggedIn() ? (
                  <>
                    <div className="flex items-center gap-4 px-6 py-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-base font-normal">
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white text-sm font-normal">{user?.name}</p>
                        <p className="text-white/40 text-[10px] uppercase tracking-widest">{user?.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-4 px-6 py-4 text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl font-normal"
                    >
                      <LogOut size={18} />
                      <span>End Session</span>
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-white text-slate-900 rounded-2xl font-normal"
                  >
                    <LogIn size={18} />
                    <span>Sign In</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

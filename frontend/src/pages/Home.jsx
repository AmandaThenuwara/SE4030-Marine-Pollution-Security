import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Users, Award, TrendingUp, ArrowRight, Quote, Sparkles, Globe, MessageSquare, Activity, Sprout, Leaf, TreeDeciduous, Anchor, ShieldCheck, Heart } from 'lucide-react';
import pureOceanLogo from '../assets/img/pureocean.png';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import Aurora from '../components/Aurora';

const Home = () => {
  const { isLoggedIn, isAdmin } = useAuth();
  const [quote, setQuote] = useState(null);
  const [fact, setFact] = useState(null);

  useEffect(() => {
    authService.getQuote().then(res => setQuote(res.data)).catch(() => { });
    authService.getFact().then(res => setFact(res.data)).catch(() => { });
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden">
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-4 pt-32 overflow-hidden bg-black">
          {/* Aurora — mix-blend-screen on black: black + color = color */}
          <div className="absolute inset-0 z-0 mix-blend-screen pointer-events-none">
            <Aurora
              colorStops={['#00F5D4', '#00BFFF', '#0066FF']}
              blend={0.6}
              amplitude={1.0}
              speed={0.5}
            />
          </div>

          {/* Hero content */}
          <div className="relative z-10 max-w-7xl mx-auto text-center h-100vh">
            

            <h1 className="text-6xl md:text-7xl font-normal tracking-tighter leading-[0.9] mb-8 animate-fade-in text-white mt-20" style={{ animationDelay: '100ms' }}>
              Protecting Our <span className="bg-gradient-to-r from-[#00F5D4] to-[#00BFFF] bg-clip-text text-transparent">Oceans</span> <br />
              <span className="text-white/90">One Achievement at a Time</span>
            </h1>

            <p className="max-w-2xl mx-auto text-lg md:text-lg text-white/50 font-normal leading-relaxed mb-12 animate-fade-in" style={{ animationDelay: '200ms' }}>
              Join a global network of dedicated volunteers. Track your impact, earn prestigious badges,
              and compete to become a leading voice in marine conservation.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <Link
                to="/leaderboard"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white text-black px-10 py-5 rounded-[2rem] text-lg font-normal hover:bg-white/90 hover:shadow-2xl hover:shadow-white/10 hover:-translate-y-1 transition-all"
              >
                <Trophy size={22} className="group-hover:rotate-12 transition-transform" />
                Live Leaderboard
              </Link>

              {!isLoggedIn() ? (
                <Link
                  to="/login"
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white/5 border border-white/15 text-white px-10 py-5 rounded-[2rem] text-lg font-normal hover:bg-white/10 hover:border-white/30 hover:-translate-y-1 transition-all"
                >
                  <Award size={22} className="text-[#00F5D4]" />
                  Get Started
                </Link>
              ) : (
                <Link
                  to={isAdmin() ? "/achievements" : "/my-achievements"}
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white/5 border border-white/15 text-white px-10 py-5 rounded-[2rem] text-lg font-normal hover:bg-white/10 hover:border-white/30 hover:-translate-y-1 transition-all"
                >
                  <Activity size={22} className="text-[#00F5D4]" />
                  Go to Hub
                </Link>
              )}
            </div>
          </div>
        </section>

        
        {/* Impact Message Section */}
        <section className="py-12 px-4">
          <div className="max-w-5xl mx-auto text-center border-y border-slate-100 py-24 px-4">
            <Globe className="mx-auto text-blue-500/20 mb-10 animate-pulse" size={80} />
            <h3 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight mb-8 tracking-tight">
              " Protect Our Oceans, Preserve Our Future "
            </h3>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-600 font-normal leading-relaxed mb-10">
              Marine pollution threatens the beauty and life beneath the waves. Join us in reducing waste, 
              protecting marine ecosystems, and creating a cleaner, healthier ocean for generations to come.
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-1 bg-gradient-to-r from-transparent to-blue-600 rounded-full"></div>
              <Sparkles className="text-blue-600" size={20} />
              <div className="w-16 h-1 bg-gradient-to-l from-transparent to-blue-600 rounded-full"></div>
            </div>
          </div>
        </section>

        {/* Dynamic Features Grid */}
        <section className="px-4 py-24 bg-slate-900 rounded-[4rem] mx-4 relative overflow-hidden mt-20">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-blue-500/5 blur-[120px] rounded-full"></div>
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-normal text-white tracking-tight mb-4">Recognizing Every Effort</h2>
              <p className="text-slate-400 font-normal text-lg">Our system is designed to celebrate impact at every level.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: <ShieldCheck size={40} />, title: 'Verified Impact', desc: 'Every point awarded is verified by our administrative team to ensure community integrity.', color: 'text-blue-400', bg: 'bg-blue-400/10' },
                { icon: <TrendingUp size={40} />, title: 'Real-time Stats', desc: 'Watch your total impact grow as we sync your achievements instantly across global leaderboards.', color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
                { icon: <Heart size={40} />, title: 'Community Driven', desc: 'Connect with thousands of ocean warriors and celebrate our collective victory for the blue planet.', color: 'text-rose-400', bg: 'bg-rose-400/10' },
              ].map((f, i) => (
                <div key={f.title} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 hover:bg-white/10 transition-all group">
                  <div className={`w-20 h-20 rounded-3xl ${f.bg} ${f.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                    {f.icon}
                  </div>
                  <h3 className="text-2xl font-normal text-white mb-4">{f.title}</h3>
                  <p className="text-slate-400 font-normal leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        
        {/* Level Tiers Section */}
        <section className="px-4 py-32 max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-normal text-slate-900 tracking-tight mb-4">Evolution Tiers</h2>
            <p className="text-slate-500 font-normal text-lg">Progress through our ranks and unlock exclusive recognition badges.</p>
          </div>
 
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                level: 'Beginner', points: '0 – 249 PTS', badge: 'Bronze', color: 'text-emerald-400', bg: 'bg-slate-900', border: 'border-slate-800', icon: <Sprout size={32} />,
                perks: ['Community Voting', 'Public Profile', 'Bronze Badge']
              },
              {
                level: 'Intermediate', points: '250 – 749 PTS', badge: 'Silver', color: 'text-blue-400', bg: 'bg-slate-900', border: 'border-slate-800', icon: <Leaf size={32} />,
                perks: ['Event Prioritization', 'Direct Messaging', 'Silver Badge']
              },
              {
                level: 'Advanced', points: '750+ PTS', badge: 'Gold', color: 'text-indigo-400', bg: 'bg-slate-900', border: 'border-slate-800', icon: <TreeDeciduous size={32} />,
                perks: ['Mentorship Access', 'Global Hero Slot', 'Gold Badge']
              },
            ].map((t) => (
              <div key={t.level} className={`rounded-[3rem] p-12 border border-slate-800 ${t.bg} group hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-500/50 transition-all hover:-translate-y-2`}>
                <div className={`w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center ${t.color} mb-10 group-hover:rotate-12 transition-transform shadow-inner`}>
                  {t.icon}
                </div>
                <h4 className="text-[10px] font-semibold uppercase tracking-[0.4em] text-slate-500 mb-3">Rank Level</h4>
                <h3 className="text-3xl font-normal text-white mb-2">{t.level}</h3>
                <p className={`text-sm font-semibold ${t.color} mb-10 tracking-widest`}>{t.points}</p>
                <div className="space-y-4">
                  {t.perks.map(p => (
                    <div key={p} className="flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${t.color} opacity-50`}></div>
                      <span className="text-sm font-normal text-slate-400 group-hover:text-slate-200 transition-colors">{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section removed: handled by global footer */}
      </div>
    </div>
  );
};

export default Home;

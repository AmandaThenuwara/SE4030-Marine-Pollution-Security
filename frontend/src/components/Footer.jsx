import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Waves, Globe, Activity, Trophy, Users, Award } from 'lucide-react';
import pureOceanLogo from '../assets/img/pureocean.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { label: 'Home',              to: '/' },
    { label: 'Leaderboard',       to: '/leaderboard' },
    { label: 'Pollution Map',     to: '/dashboard' },
    { label: 'Pollution Reports', to: '/reports-dashboard' },
    { label: 'Volunteers',        to: '/volunteers' },
    { label: 'My Achievements',   to: '/my-achievements' },
  ];

  const stats = [
    { val: '500+', label: 'Warriors' },
    { val: '10K+', label: 'Points' },
    { val: '50+', label: 'Cleanups' },
    { val: '12',   label: 'Countries' },
  ];

  return (
    <footer style={{
      background: '#0f172a', // slate-900
      paddingTop: '80px',
      paddingBottom: '40px',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      color: '#ffffff',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* ── Main Content Grid ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '64px',
          marginBottom: '80px',
        }}>
          
          {/* 1. Brand & Description (The 'Logo and wording part') */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ height: '42px', marginBottom: '24px' }}>
              <img
                src={pureOceanLogo}
                alt="PureOcean"
                style={{ height: '100%', objectFit: 'contain', display: 'block' }}
              />
            </div>
            <p style={{
              fontSize: '15px',
              lineHeight: '1.65',
              color: '#94a3b8', // slate-400
              fontWeight: 400,
              margin: 0,
            }}>
              The definitive platform for tracking, recognizing, and scaling marine conservation efforts globally.
            </p>
            <div style={{ marginTop: '32px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '8px 16px', borderRadius: '12px',
                background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.1)',
                fontSize: '12px', color: '#0ea5e9', fontWeight: 400,
              }}>
                <Waves size={14} />
                Crafted for the blue
              </div>
            </div>
          </div>

          {/* 2. Platform Navigation */}
          <div>
            <h4 style={{ fontSize: '11px', fontWeight: 600, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '28px' }}>
              Platform
            </h4>
            <div style={{ display: 'grid', gap: '14px' }}>
              {navLinks.map(({ label, to }) => (
                <Link
                  key={label}
                  to={to}
                  style={{ fontSize: '14px', color: '#64748b', textDecoration: 'none', fontWeight: 400, transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#38bdf8'}
                  onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* 3. Contact Info */}
          <div>
            <h4 style={{ fontSize: '11px', fontWeight: 600, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '28px' }}>
              Contact Us
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#64748b' }}>
                <Phone size={16} style={{ color: '#0ea5e9' }} />
                <span>+94 11 234 5678</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#64748b' }}>
                <Mail size={16} style={{ color: '#0ea5e9' }} />
                <span>hello@pureocean.org</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '14px', color: '#64748b' }}>
                <MapPin size={16} style={{ color: '#0ea5e9', marginTop: '2px' }} />
                <span>Marine Conservation Centre,<br />Colombo 03, Sri Lanka</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div style={{
          paddingTop: '32px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px',
        }}>
          <p style={{ fontSize: '11px', color: '#475569', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            © {currentYear} PUREOCEAN. CRAFTED FOR THE BLUE.
          </p>
          <div style={{ display: 'flex', gap: '24px' }}>
            {['Privacy', 'Legal', 'Guidelines'].map(l => (
              <button key={l} style={{
                background: 'none', border: 'none', padding: 0,
                fontSize: '11px', color: '#475569', fontWeight: 400,
                textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer',
                transition: 'color 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
              onMouseLeave={e => e.currentTarget.style.color = '#475569'}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 24px !important; }
        }
      `}</style>
    </footer>
  );
};

export default Footer;

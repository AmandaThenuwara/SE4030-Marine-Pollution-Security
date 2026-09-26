import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, Eye, EyeOff, Shield, ChevronRight, Sparkles, Waves } from 'lucide-react';
import pureOceanLogo from '../assets/img/pureocean.png';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'volunteer',
        adminKey: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({ name: '', email: '' });
    const [googleLoaded, setGoogleLoaded] = useState(false);

    const { login, register, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const validateName = (name) => {
        if (!name.trim()) return '';
        const nameRegex = /^[A-Za-z\s]+$/;
        if (!nameRegex.test(name)) {
            return 'Name should contain only letters';
        }
        return '';
    };

    const validateEmail = (email) => {
        if (!email.trim()) return '';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return 'Please enter a valid email address';
        }
        return '';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');

        if (name === 'name') {
            setFieldErrors(prev => ({ ...prev, name: validateName(value) }));
        }
        if (name === 'email') {
            setFieldErrors(prev => ({ ...prev, email: validateEmail(value) }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let response;
            const emailError = validateEmail(formData.email);
            if (emailError) {
                setFieldErrors(prev => ({ ...prev, email: emailError }));
                setLoading(false);
                return;
            }

            if (isLogin) {
                response = await login({ email: formData.email, password: formData.password });
            } else {
                if (!formData.name.trim()) {
                    setError('Primary name is required');
                    setLoading(false);
                    return;
                }
                const nameError = validateName(formData.name);
                if (nameError) {
                    setFieldErrors(prev => ({ ...prev, name: nameError }));
                    setLoading(false);
                    return;
                }
                response = await register(formData);
            }

            const userRole = response.data.user.role;
            if (userRole === 'Cleanup_Task_Manager') {
                navigate('/dashboard');
            } else if (userRole === 'volunteer') {
                navigate('/volunteers');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.message || 'Authentication failed. Please verify credentials.');
        } finally {
            setLoading(false);
        }
    };

    // Google Identity Services Credential Handler
    const handleGoogleCredentialResponse = useCallback(async (response) => {
        if (!response?.credential) {
            setError('Google sign-in was cancelled or did not return a valid credential.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await loginWithGoogle(response.credential);
            const userRole = res?.data?.user?.role;
            if (userRole === 'Cleanup_Task_Manager') {
                navigate('/dashboard');
            } else if (userRole === 'admin') {
                navigate('/');
            } else {
                navigate('/volunteers');
            }
        } catch (err) {
            console.error('Google authentication error:', err);
            setError(err?.message || 'Google authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [loginWithGoogle, navigate]);

    // Initialize Google Identity Services
    useEffect(() => {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        const isPlaceholder = !clientId || clientId.includes('your_google_client_id_here');

        const initGoogle = () => {
            if (window.google?.accounts?.id && !isPlaceholder) {
                try {
                    window.google.accounts.id.initialize({
                        client_id: clientId,
                        callback: handleGoogleCredentialResponse,
                        auto_select: false,
                        cancel_on_tap_outside: true,
                    });

                    const btnContainer = document.getElementById('googleSignInContainer');
                    if (btnContainer) {
                        btnContainer.innerHTML = '';
                        window.google.accounts.id.renderButton(btnContainer, {
                            theme: 'outline',
                            size: 'large',
                            type: 'standard',
                            shape: 'rectangular',
                            text: 'continue_with',
                            width: '380',
                            logo_alignment: 'left'
                        });
                        setGoogleLoaded(true);
                    }
                } catch (e) {
                    console.warn('Google Identity initialization notice:', e.message);
                }
            }
        };

        if (window.google?.accounts?.id) {
            initGoogle();
        } else {
            const timer = setTimeout(initGoogle, 800);
            return () => clearTimeout(timer);
        }
    }, [handleGoogleCredentialResponse]);

    const handleGoogleButtonClick = () => {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        const isPlaceholder = !clientId || clientId.includes('your_google_client_id_here');

        if (isPlaceholder) {
            setError('Google OAuth Client ID is not configured. Please set VITE_GOOGLE_CLIENT_ID in frontend/.env to enable live Google sign-in.');
            return;
        }

        if (window.google?.accounts?.id) {
            window.google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed() || notification.isSkippedMomentum()) {
                    console.log('Google prompt status:', notification.getNotDisplayedReason?.());
                }
            });
        } else {
            setError('Google Identity service is still loading. Please refresh and try again.');
        }
    };

    return (
        <div className="min-h-screen flex overflow-hidden" style={{ background: '#f0f9ff' }}>
            {/* ── Left Branding Panel ── */}
            <div
                className="hidden lg:flex w-[46%] relative flex-col justify-between p-12"
                style={{
                    background: 'linear-gradient(155deg, #0c4a6e 0%, #075985 30%, #0369a1 60%, #0ea5e9 100%)',
                }}
            >
                {/* Subtle wave overlay */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                />

                {/* Ocean photo overlay */}
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&q=80&w=1200')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: 0.18,
                        mixBlendMode: 'luminosity',
                    }}
                />

                {/* Logo */}
                <div className="relative z-10">
                    <div className="h-14 w-40 overflow-hidden">
                        <img src={pureOceanLogo} alt="Pure Ocean" className="w-full h-full object-contain object-left" />
                    </div>
                </div>

                {/* Headline */}
                <div className="relative z-10 flex-1 flex flex-col justify-center py-10">
                    <div
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs uppercase tracking-widest mb-8 w-fit"
                        style={{ background: 'rgba(255,255,255,0.12)', color: '#bae6fd', border: '1px solid rgba(255,255,255,0.18)' }}
                    >
                        <Waves size={12} />
                        Ocean Conservation Platform
                    </div>

                    <h2
                        className="leading-tight mb-6"
                        style={{ fontSize: '2.8rem', color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.15, fontWeight: 600 }}
                    >
                        Protecting Our<br />
                        <span style={{ color: '#7dd3fc' }}>Blue Planet,</span><br />
                        Together.
                    </h2>

                    <p style={{ color: '#bae6fd', fontSize: '1rem', lineHeight: 1.75, maxWidth: '340px', fontWeight: 400 }}>
                        Join thousands of ocean guardians coordinating clean-up missions and making a lasting impact on marine ecosystems.
                    </p>
                </div>

                {/* Stats */}
                <div className="relative z-10 flex items-center gap-10">
                    {[
                        { val: '12K+', label: 'Impact Members' },
                        { val: '500+', label: 'Verified Missions' },
                        { val: '98%', label: 'Success Rate' },
                    ].map(s => (
                        <div key={s.label}>
                            <p className="text-white" style={{ fontSize: '1.6rem', lineHeight: 1, fontWeight: 600 }}>{s.val}</p>
                            <p style={{ color: '#7dd3fc', fontSize: '10px', fontWeight: 400, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '4px' }}>{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Decorative bottom wave */}
                <div className="absolute bottom-0 left-0 right-0 h-24 opacity-10" style={{ overflow: 'hidden' }}>
                    <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                        <path d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z" fill="white" />
                    </svg>
                </div>
            </div>

            {/* ── Right Form Panel ── */}
            <div
                className="w-full lg:w-[54%] flex flex-col justify-center px-8 md:px-16 lg:px-20 xl:px-28 relative"
                style={{ background: '#f8fafc' }}
            >
                {/* Mobile logo */}
                <div className="lg:hidden mb-8">
                    <img src={pureOceanLogo} alt="Pure Ocean" className="h-10 w-36 object-contain object-left" />
                </div>

                <div className="max-w-[420px] w-full mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h3
                            className="tracking-tight mb-1.5"
                            style={{ fontSize: '2rem', color: '#0c1a2e', letterSpacing: '-0.015em', fontWeight: 600 }}
                        >
                            {isLogin ? 'Welcome back' : 'Create your account'}
                        </h3>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 400 }}>
                            {isLogin
                                ? 'Sign in to access your ocean guardian hub.'
                                : 'Join the mission to protect our oceans.'}
                        </p>
                    </div>

                    {/* ── Tab Switcher ── */}
                    <div
                        className="flex mb-8 p-1 rounded-2xl"
                        style={{ background: '#e2e8f0' }}
                    >
                        <button
                            onClick={() => { setIsLogin(true); setError(''); }}
                            className="flex-1 py-3 rounded-xl text-sm tracking-wide transition-all duration-200"
                            style={isLogin
                                ? { background: '#ffffff', color: '#0369a1', boxShadow: '0 2px 8px rgba(3,105,161,0.12)', fontWeight: 500 }
                                : { background: 'transparent', color: '#94a3b8', fontWeight: 400 }
                            }
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => { setIsLogin(false); setError(''); }}
                            className="flex-1 py-3 rounded-xl text-sm tracking-wide transition-all duration-200"
                            style={!isLogin
                                ? { background: '#ffffff', color: '#0369a1', boxShadow: '0 2px 8px rgba(3,105,161,0.12)', fontWeight: 500 }
                                : { background: 'transparent', color: '#94a3b8', fontWeight: 400 }
                            }
                        >
                            Register
                        </button>
                    </div>

                    {/* ── Error Banner ── */}
                    {error && (
                        <div
                            className="flex items-start gap-3 px-4 py-3.5 rounded-xl mb-6 text-sm font-semibold"
                            style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c' }}
                        >
                            <span className="mt-0.5 shrink-0">⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* ── Form ── */}
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Full Name (register only) */}
                        {!isLogin && (
                            <div>
                                <label
                                    className="block mb-1.5 text-xs uppercase tracking-wider"
                                    style={{ color: '#475569', fontWeight: 500 }}
                                >
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Your full name"
                                    className="w-full px-4 py-3.5 rounded-xl text-sm transition-all duration-200"
                                    style={{
                                        background: '#ffffff',
                                        border: fieldErrors.name ? '1.5px solid #f87171' : '1.5px solid #e2e8f0',
                                        color: '#0f172a',
                                        outline: 'none',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#0ea5e9'}
                                    onBlur={e => e.target.style.borderColor = fieldErrors.name ? '#f87171' : '#e2e8f0'}
                                />
                                {fieldErrors.name && (
                                    <p className="mt-1.5 text-xs font-semibold" style={{ color: '#ef4444' }}>{fieldErrors.name}</p>
                                )}
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label
                                className="block mb-1.5 text-xs uppercase tracking-wider"
                                style={{ color: '#475569', fontWeight: 500 }}
                            >
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="you@example.com"
                                className="w-full px-4 py-3.5 rounded-xl text-sm transition-all duration-200"
                                style={{
                                    background: '#ffffff',
                                    border: fieldErrors.email ? '1.5px solid #f87171' : '1.5px solid #e2e8f0',
                                    color: '#0f172a',
                                    outline: 'none',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                                }}
                                onFocus={e => e.target.style.borderColor = '#0ea5e9'}
                                onBlur={e => e.target.style.borderColor = fieldErrors.email ? '#f87171' : '#e2e8f0'}
                            />
                            {fieldErrors.email && (
                                <p className="mt-1.5 text-xs" style={{ color: '#ef4444' }}>{fieldErrors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                className="block mb-1.5 text-xs uppercase tracking-wider"
                                style={{ color: '#475569', fontWeight: 500 }}
                            >
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3.5 pr-12 rounded-xl text-sm transition-all duration-200"
                                    style={{
                                        background: '#ffffff',
                                        border: '1.5px solid #e2e8f0',
                                        color: '#0f172a',
                                        outline: 'none',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#0ea5e9'}
                                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-150"
                                    style={{ color: '#94a3b8' }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#0369a1'}
                                    onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Register-only: Role & Admin Key */}
                        {!isLogin && (
                            <div className="space-y-5 pt-1">
                                <div>
                                    <label
                                        className="block mb-1.5 text-xs uppercase tracking-wider"
                                        style={{ color: '#475569', fontWeight: 500 }}
                                    >
                                        Operational Role
                                    </label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3.5 rounded-xl text-sm transition-all duration-200 cursor-pointer"
                                        style={{
                                            background: '#ffffff',
                                            border: '1.5px solid #e2e8f0',
                                            color: '#0f172a',
                                            outline: 'none',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                                            appearance: 'auto',
                                        }}
                                    >
                                        <option value="volunteer">Volunteer</option>
                                        <option value="Cleanup_Task_Manager">Cleanup Task Manager</option>
                                        <option value="admin">Platform Administrator</option>
                                    </select>
                                </div>

                                {formData.role === 'admin' && (
                                    <div
                                        className="p-4 rounded-xl"
                                        style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe' }}
                                    >
                                        <label
                                            className="flex items-center gap-1.5 mb-2 text-xs uppercase tracking-wider"
                                            style={{ color: '#1d4ed8', fontWeight: 500 }}
                                        >
                                            <Shield size={11} />
                                            Admin Validation Key
                                        </label>
                                        <input
                                            type="password"
                                            name="adminKey"
                                            value={formData.adminKey}
                                            onChange={handleChange}
                                            placeholder="Enter authorization secret"
                                            className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200"
                                            style={{
                                                background: '#ffffff',
                                                border: '1.5px solid #bfdbfe',
                                                color: '#1e3a8a',
                                                outline: 'none',
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Primary CTA */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl text-sm tracking-wide transition-all duration-200"
                            style={{
                                background: loading ? '#7dd3fc' : 'linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%)',
                                color: '#ffffff',
                                boxShadow: loading ? 'none' : '0 8px 24px rgba(14,165,233,0.35)',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transform: 'translateY(0)',
                                border: 'none',
                            }}
                            onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            {loading ? (
                                <div
                                    className="w-5 h-5 rounded-full border-[2.5px]"
                                    style={{ borderColor: 'rgba(255,255,255,0.35)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }}
                                />
                            ) : (
                                <>
                                    <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                                    <ChevronRight size={17} strokeWidth={2.5} />
                                </>
                            )}
                        </button>

                        {/* OAuth 2.0 / OpenID Connect: Continue with Google */}
                        <div className="pt-2">
                            <div className="flex items-center gap-3 mb-3 text-xs uppercase tracking-wider" style={{ color: '#94a3b8' }}>
                                <div className="flex-1 h-px" style={{ background: '#e2e8f0' }} />
                                <span>or continue with</span>
                                <div className="flex-1 h-px" style={{ background: '#e2e8f0' }} />
                            </div>

                            {/* Render container for Google Identity button */}
                            <div
                                id="googleSignInContainer"
                                className="w-full flex justify-center mb-1"
                                style={{ minHeight: '44px' }}
                            />

                            {/* Custom fallback Continue with Google button */}
                            {!googleLoaded && (
                                <button
                                    type="button"
                                    onClick={handleGoogleButtonClick}
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200"
                                    style={{
                                        background: '#ffffff',
                                        color: '#1e293b',
                                        border: '1.5px solid #cbd5e1',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                        cursor: loading ? 'not-allowed' : 'pointer'
                                    }}
                                    onMouseEnter={e => {
                                        if (!loading) {
                                            e.currentTarget.style.background = '#f8fafc';
                                            e.currentTarget.style.borderColor = '#94a3b8';
                                        }
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = '#ffffff';
                                        e.currentTarget.style.borderColor = '#cbd5e1';
                                    }}
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                    </svg>
                                    <span>Continue with Google</span>
                                </button>
                            )}
                        </div>

                        {/* Demo Buttons (sign-in only) */}
                        {isLogin && (
                            <div className="space-y-2.5 pt-1">
                                <div
                                    className="flex items-center gap-3 text-xs uppercase tracking-wider"
                                    style={{ color: '#94a3b8', fontWeight: 400 }}
                                >
                                    <div className="flex-1 h-px" style={{ background: '#e2e8f0' }} />
                                    Quick Demo Access
                                    <div className="flex-1 h-px" style={{ background: '#e2e8f0' }} />
                                </div>

                                {/* Demo CTM */}
                                <button
                                    type="button"
                                    onClick={async () => {
                                        setLoading(true);
                                        setError('');
                                        try {
                                            const res = await login({ email: 'cleanup@gmail.com', password: 'cleanup123' });
                                            if (res?.data?.user?.role === 'Cleanup_Task_Manager') {
                                                navigate('/dashboard');
                                            } else {
                                                setError('Demo CTM login failed — user role mismatch.');
                                            }
                                        } catch (err) {
                                            setError('Demo CTM login failed. Is the backend running?');
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200"
                                    style={{
                                        background: 'linear-gradient(135deg, #0c4a6e, #0369a1)',
                                        color: '#bae6fd',
                                        border: 'none',
                                        cursor: 'pointer',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                >
                                    <Sparkles size={13} />
                                    Demo — Cleanup Task Manager
                                </button>

                                {/* Demo Volunteer */}
                                <button
                                    type="button"
                                    onClick={async () => {
                                        setLoading(true);
                                        try {
                                            await login({ email: 'volunteer@gmail.com', password: 'password123' });
                                            navigate('/volunteers');
                                        } catch (err) {
                                            setError('Demo login failed');
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200"
                                    style={{
                                        background: '#ffffff',
                                        color: '#0369a1',
                                        border: '1.5px solid #bae6fd',
                                        cursor: 'pointer',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#f0f9ff'; e.currentTarget.style.borderColor = '#7dd3fc'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#bae6fd'; }}
                                >
                                    <Sparkles size={13} />
                                    Demo — Volunteer Access
                                </button>
                            </div>
                        )}
                    </form>

                    {/* Footer */}
                    <div className="mt-10 text-center">
                        <p className="text-xs" style={{ color: '#cbd5e1', letterSpacing: '0.06em', fontWeight: 400 }}>
                            © 2026 PureOcean · Version 2.0
                        </p>
                    </div>
                </div>
            </div>

            {/* Spin keyframe injected inline */}
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Login;

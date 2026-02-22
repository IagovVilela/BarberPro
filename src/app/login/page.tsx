'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Scissors, Eye, EyeOff, AlertCircle, Star } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await signIn('credentials', { email, password, redirect: false });
        if (result?.error) {
            setError('Email ou senha incorretos');
            setLoading(false);
        } else {
            router.push('/dashboard');
        }
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '16px 16px 16px 16px',
        borderRadius: '16px',
        fontSize: '14px',
        outline: 'none',
        background: 'var(--bg-card)',
        border: '2px solid var(--border)',
        color: 'var(--text-primary)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        fontFamily: 'Inter, system-ui, sans-serif',
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.style.borderColor = 'var(--accent)';
        e.target.style.boxShadow = '0 0 0 4px var(--accent-light)';
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.style.borderColor = 'var(--border)';
        e.target.style.boxShadow = 'var(--shadow-sm)';
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: '#0F1419' }}>
            {/* Left side - decorative panel (desktop only) */}
            <div style={{
                width: '55%',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #0F1419 0%, #1A2B32 30%, #2A6F7F 60%, #7C8C6E 100%)',
            }} className="hidden lg:!flex">
                {/* Grid overlay */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px',
                }} />

                {/* Floating orbs */}
                <motion.div
                    animate={{ y: [-20, 20, -20], x: [-10, 10, -10] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                        position: 'absolute', top: '15%', left: '20%', width: 256, height: 256, borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(42,111,127,0.15) 0%, transparent 70%)',
                    }}
                />
                <motion.div
                    animate={{ y: [20, -20, 20], x: [10, -10, 10] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                        position: 'absolute', bottom: '20%', right: '15%', width: 384, height: 384, borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(124,140,110,0.12) 0%, transparent 70%)',
                    }}
                />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ position: 'relative', zIndex: 10, padding: '0 64px', maxWidth: 480 }}
                >
                    <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                        style={{
                            width: 80, height: 80, marginBottom: 40, borderRadius: 16,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                        }}
                    >
                        <Scissors size={36} color="rgba(255,255,255,0.9)" />
                    </motion.div>

                    <h1 style={{ fontSize: 48, fontWeight: 700, color: '#fff', marginBottom: 16, lineHeight: 1.1 }}>
                        Barber<span style={{ color: '#3B9FB0' }}>Pro</span>
                    </h1>
                    <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.5)', marginBottom: 48, lineHeight: 1.6 }}>
                        Sistema inteligente de gerenciamento para barbearias modernas
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {['📅 Agendamentos inteligentes', '💰 Controle financeiro', '📊 Dashboard em tempo real', '📦 Gestão de estoque'].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.1 }}
                                style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}
                            >
                                {item}
                            </motion.div>
                        ))}
                    </div>

                    <div style={{ marginTop: 64, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ display: 'flex', gap: 2 }}>
                            {[1, 2, 3, 4, 5].map(i => (
                                <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />
                            ))}
                        </div>
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginLeft: 4 }}>Usado por 500+ barbearias</span>
                    </div>
                </motion.div>
            </div>

            {/* Right side - login form */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                background: 'var(--bg-primary)',
                position: 'relative',
            }}>
                {/* Mobile header */}
                <div className="lg:!hidden" style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 180,
                    background: 'linear-gradient(135deg, #1E2A2E 0%, #2A6F7F 50%, #7C8C6E 100%)',
                    borderRadius: '0 0 24px 24px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: 12,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.1)',
                        }}>
                            <Scissors size={24} color="#fff" />
                        </div>
                        <div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>
                                Barber<span style={{ color: '#7BCED9' }}>Pro</span>
                            </div>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Sistema de Gestão</div>
                        </div>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{ width: '100%', maxWidth: 420, marginTop: 100 }}
                    className="lg:!mt-0"
                >
                    {/* Welcome text */}
                    <div style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                            Bem-vindo de volta 👋
                        </h2>
                        <p style={{ fontSize: 15, color: 'var(--text-muted)' }}>
                            Faça login para acessar o painel de gestão
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    padding: 16, borderRadius: 16, marginBottom: 20,
                                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
                                }}
                            >
                                <AlertCircle size={18} color="#EF4444" />
                                <span style={{ fontSize: 14, color: '#EF4444' }}>{error}</span>
                            </motion.div>
                        )}

                        {/* Email field */}
                        <div style={{ marginBottom: 20 }}>
                            <label style={{
                                display: 'block', fontSize: 14, fontWeight: 600,
                                color: 'var(--text-primary)', marginBottom: 8,
                            }}>
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                required
                                style={inputStyle}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                            />
                        </div>

                        {/* Password field */}
                        <div style={{ marginBottom: 24 }}>
                            <label style={{
                                display: 'block', fontSize: 14, fontWeight: 600,
                                color: 'var(--text-primary)', marginBottom: 8,
                            }}>
                                Senha
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    style={{ ...inputStyle, paddingRight: 48 }}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: 'var(--text-muted)', padding: 4,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit button */}
                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: 1.01, boxShadow: '0 8px 25px rgba(42,111,127,0.35)' }}
                            whileTap={{ scale: 0.99 }}
                            style={{
                                width: '100%', padding: '16px 0', borderRadius: 16,
                                background: 'linear-gradient(135deg, #2A6F7F 0%, #1E5A68 100%)',
                                color: '#fff', fontWeight: 600, fontSize: 14, border: 'none',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.6 : 1,
                                boxShadow: '0 4px 15px rgba(42,111,127,0.25)',
                                transition: 'all 0.3s',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                fontFamily: 'Inter, system-ui, sans-serif',
                            }}
                        >
                            {loading ? (
                                <>
                                    <div style={{
                                        width: 18, height: 18, borderRadius: '50%',
                                        border: '2px solid rgba(255,255,255,0.3)',
                                        borderTopColor: '#fff',
                                        animation: 'spin 0.6s linear infinite',
                                    }} />
                                    Entrando...
                                </>
                            ) : (
                                <>
                                    Entrar no Sistema
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </>
                            )}
                        </motion.button>
                    </form>

                    {/* Demo credentials */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        style={{
                            marginTop: 32, padding: 20, borderRadius: 16,
                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                            boxShadow: 'var(--shadow-sm)', position: 'relative', overflow: 'hidden',
                        }}
                    >
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                            background: 'linear-gradient(90deg, #2A6F7F, #7C8C6E)',
                        }} />
                        <p style={{
                            fontWeight: 600, fontSize: 14, color: 'var(--accent)',
                            marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8,
                        }}>
                            🔑 Credenciais Demo
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {[
                                { label: 'Admin', email: 'admin@barberpro.com', pass: 'admin123', color: '#2A6F7F' },
                                { label: 'Barbeiro', email: 'carlos@barberpro.com', pass: 'barber123', color: '#7C8C6E' },
                                { label: 'Recepção', email: 'ana@barberpro.com', pass: 'recepcao123', color: '#F59E0B' },
                            ].map((cred) => (
                                <div
                                    key={cred.label}
                                    onClick={() => { setEmail(cred.email); setPassword(cred.pass); }}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '10px 12px', borderRadius: 12,
                                        background: 'var(--bg-secondary)', cursor: 'pointer',
                                        transition: 'opacity 0.2s',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{
                                            width: 28, height: 28, borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: cred.color, color: '#fff',
                                            fontSize: 12, fontWeight: 700,
                                        }}>
                                            {cred.label[0]}
                                        </div>
                                        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                                            {cred.label}
                                        </span>
                                    </div>
                                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cred.email}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <p style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: 'var(--text-muted)' }}>
                        BarberPro © 2024 · Todos os direitos reservados
                    </p>
                </motion.div>
            </div>

            <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}

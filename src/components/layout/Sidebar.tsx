'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';
import {
    LayoutDashboard, Calendar, Users, Scissors, UserCog,
    DollarSign, Package, Sun, Moon, LogOut, Menu, X, ChevronLeft, Sparkles
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'barbeiro', 'recepcao'] },
    { href: '/dashboard/agendamentos', icon: Calendar, label: 'Agendamentos', roles: ['admin', 'barbeiro', 'recepcao'] },
    { href: '/dashboard/clientes', icon: Users, label: 'Clientes', roles: ['admin', 'barbeiro', 'recepcao'] },
    { href: '/dashboard/servicos', icon: Scissors, label: 'Serviços', roles: ['admin', 'recepcao'] },
    { href: '/dashboard/barbeiros', icon: UserCog, label: 'Barbeiros', roles: ['admin'] },
    { href: '/dashboard/financeiro', icon: DollarSign, label: 'Financeiro', roles: ['admin'] },
    { href: '/dashboard/estoque', icon: Package, label: 'Estoque', roles: ['admin', 'recepcao'] },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const { theme, toggleTheme } = useTheme();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const userRole = (session?.user as { role?: string })?.role || 'barbeiro';

    const filteredItems = navItems.filter(item => item.roles.includes(userRole));

    const SidebarContent = () => (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Logo */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '32px 20px 24px', // Balanced top padding
                borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}>
                <div style={{
                    width: 44, height: 44, borderRadius: 14, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    background: 'linear-gradient(135deg, #2A6F7F, #7C8C6E)',
                    flexShrink: 0,
                }}>
                    <Sparkles size={24} color="#fff" />
                </div>
                {!collapsed && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>BarberPro</h1>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>Gerenciamento</p>
                    </motion.div>
                )}
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {filteredItems.map(item => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/dashboard' && pathname.startsWith(item.href));
                        return (
                            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                                style={{ textDecoration: 'none' }}>
                                <motion.div
                                    whileHover={{ x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 14,
                                        padding: collapsed ? '12px' : '12px 16px',
                                        borderRadius: 12, transition: 'all 0.2s',
                                        justifyContent: collapsed ? 'center' : 'flex-start',
                                        color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                                        background: isActive ? 'linear-gradient(135deg, rgba(42,111,127,0.4), rgba(124,140,110,0.3))' : 'transparent',
                                        boxShadow: isActive ? '0 2px 8px rgba(42,111,127,0.3)' : 'none',
                                    }}
                                >
                                    <item.icon size={22} />
                                    {!collapsed && (
                                        <span style={{ fontSize: 14, fontWeight: isActive ? 600 : 500 }}>{item.label}</span>
                                    )}
                                    {isActive && !collapsed && (
                                        <motion.div
                                            layoutId="activeIndicator"
                                            style={{
                                                marginLeft: 'auto', width: 6, height: 6,
                                                borderRadius: '50%', background: '#fff',
                                            }}
                                        />
                                    )}
                                </motion.div>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Footer */}
            <div style={{
                padding: '12px 12px 16px', borderTop: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', flexDirection: 'column', gap: 4,
            }}>
                <button
                    onClick={toggleTheme}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 14, width: '100%',
                        padding: collapsed ? '12px' : '12px 16px', borderRadius: 12,
                        color: 'rgba(255,255,255,0.5)', background: 'transparent',
                        border: 'none', cursor: 'pointer', fontSize: 14,
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                >
                    {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
                    {!collapsed && <span>{theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}</span>}
                </button>

                {/* User info */}
                {!collapsed && session?.user && (
                    <div style={{ padding: '10px 16px' }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {session.user.name}
                        </p>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
                            {session.user.email}
                        </p>
                    </div>
                )}

                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 14, width: '100%',
                        padding: collapsed ? '12px' : '12px 16px', borderRadius: 12,
                        color: 'rgba(255,255,255,0.5)', background: 'transparent',
                        border: 'none', cursor: 'pointer', fontSize: 14,
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#F87171')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                >
                    <LogOut size={22} />
                    {!collapsed && <span>Sair</span>}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <motion.aside
                animate={{ width: collapsed ? 76 : 272 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="hidden lg:flex"
                style={{
                    flexDirection: 'column', position: 'fixed', left: 0, top: 0,
                    height: '100vh', zIndex: 40, background: 'var(--bg-sidebar)',
                }}
            >
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    style={{
                        position: 'absolute', right: -14, top: 32, width: 28, height: 28,
                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 50, boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer',
                    }}
                >
                    <ChevronLeft size={16} style={{ transition: 'transform 0.3s', transform: collapsed ? 'rotate(180deg)' : 'none' }} />
                </button>
                <SidebarContent />
            </motion.aside>

            {/* Mobile Header */}
            <div className="lg:hidden flex"
                style={{
                    position: 'fixed', top: 0, left: 0, right: 0,
                    height: 'calc(80px + env(safe-area-inset-top))',
                    zIndex: 40, alignItems: 'flex-end', justifyContent: 'space-between',
                    padding: '16px 16px', boxShadow: '0 1px 12px rgba(0,0,0,0.1)',
                    background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button onClick={() => setMobileOpen(true)}
                        style={{ padding: 8, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
                        <Menu size={24} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10, display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            background: 'linear-gradient(135deg, #2A6F7F, #7C8C6E)',
                        }}>
                            <Sparkles size={18} color="#fff" />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>BarberPro</span>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={toggleTheme}
                        style={{ padding: 8, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
                    </button>
                </div>
            </div>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="lg:hidden"
                            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 90 }}
                            onClick={() => setMobileOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: -300 }}
                            animate={{ x: 0 }}
                            exit={{ x: -300 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="lg:hidden"
                            style={{
                                position: 'fixed', left: 0, top: 0, height: '100vh', width: 288,
                                zIndex: 100, background: 'var(--bg-sidebar)',
                                boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
                                paddingTop: 'calc(80px + env(safe-area-inset-top))', // Space for the Close button and avoiding top cutoff
                            }}
                        >
                            <button
                                onClick={() => setMobileOpen(false)}
                                style={{
                                    position: 'absolute', top: 16, right: 16, padding: 8, borderRadius: 8,
                                    color: 'rgba(255,255,255,0.5)', background: 'transparent',
                                    border: 'none', cursor: 'pointer',
                                }}
                            >
                                <X size={22} />
                            </button>
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Spacer */}
            <div className={`hidden lg:block flex-shrink-0 transition-all duration-300`}
                style={{ width: collapsed ? 76 : 272 }} />
        </>
    );
}

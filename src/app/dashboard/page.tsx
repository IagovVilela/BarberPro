'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    DollarSign, TrendingUp, Calendar, Users, Scissors,
    BarChart3, Clock, Award, AlertTriangle
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

interface DashboardData {
    todayRevenue: number;
    monthRevenue: number;
    todayAppointments: number;
    completedToday: number;
    cancellationRate: number;
    topServices: { name: string; count: number; revenue: number }[];
    topBarbers: { name: string; revenue: number; count: number }[];
    revenueByDay: { date: string; revenue: number }[];
    peakHours: { hour: string; count: number }[];
    totalClients: number;
}

const COLORS = ['#2A6F7F', '#7C8C6E', '#D4A373', '#E9C46A', '#264653'];

function KPICard({ icon: Icon, label, value, sub, color, delay }: {
    icon: typeof DollarSign; label: string; value: string; sub?: string; color: string; delay: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            className="rounded-2xl transition-all duration-300 hover:shadow-lg"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', padding: 24 }}
        >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ padding: 12, borderRadius: 14, background: color + '15' }}>
                    <Icon size={24} style={{ color }} />
                </div>
                {sub && (
                    <span style={{ fontSize: 12, fontWeight: 600, padding: '5px 10px', borderRadius: 8, background: 'var(--olive-light)', color: 'var(--olive)' }}>
                        {sub}
                    </span>
                )}
            </div>
            <p style={{ fontSize: 28, fontWeight: 700, marginBottom: 4, color: 'var(--text-primary)' }}>{value}</p>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>{label}</p>
        </motion.div>
    );
}

function SkeletonCard() {
    return (
        <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="skeleton w-10 h-10 rounded-xl mb-3" />
            <div className="skeleton w-24 h-7 rounded mb-2" />
            <div className="skeleton w-32 h-4 rounded" />
        </div>
    );
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/dashboard')
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Carregando dados...</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="skeleton rounded-2xl h-72" />
                    <div className="skeleton rounded-2xl h-72" />
                </div>
            </div>
        );
    }

    if (!data) return null;

    const chartData = data.revenueByDay.map(d => ({
        ...d,
        date: d.date.split('-').slice(1).join('/'),
    }));

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>Dashboard</h1>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>Visão geral do seu negócio</p>
            </motion.div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard icon={DollarSign} label="Faturamento Hoje" value={formatCurrency(data.todayRevenue)} color="#2A6F7F" delay={0.1} />
                <KPICard icon={TrendingUp} label="Faturamento do Mês" value={formatCurrency(data.monthRevenue)} color="#7C8C6E" delay={0.2} />
                <KPICard icon={Calendar} label="Agendamentos Hoje" value={String(data.todayAppointments)} sub={`${data.completedToday} concluídos`} color="#D4A373" delay={0.3} />
                <KPICard icon={AlertTriangle} label="Taxa de Cancelamento" value={`${data.cancellationRate}%`} sub="este mês" color="#EF4444" delay={0.4} />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Revenue Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="rounded-2xl"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', padding: 24 }}
                >
                    <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: 'var(--text-primary)' }}>
                        Faturamento (últimos 15 dias)
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2A6F7F" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#2A6F7F" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                            <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '12px',
                                    color: 'var(--text-primary)',
                                }}
                                formatter={(value: number | undefined) => [formatCurrency(value ?? 0), 'Receita']}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#2A6F7F" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Top Services */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="rounded-2xl"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', padding: 24 }}
                >
                    <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: 'var(--text-primary)' }}>
                        Serviços Mais Vendidos
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={data.topServices} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                            <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '12px',
                                    color: 'var(--text-primary)',
                                }}
                            />
                            <Bar dataKey="count" fill="#7C8C6E" radius={[0, 6, 6, 0]} name="Qtd" />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Top Barbers */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="rounded-2xl p-5"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
                >
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <Award size={20} style={{ color: 'var(--accent)' }} /> Ranking Barbeiros
                    </h3>
                    <div className="space-y-3">
                        {data.topBarbers.map((barber, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                                    style={{ background: COLORS[i] || COLORS[0] }}>
                                    {i + 1}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{barber.name}</p>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{barber.count} atendimentos</p>
                                </div>
                                <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                                    {formatCurrency(barber.revenue)}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Peak Hours */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="rounded-2xl p-5"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
                >
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <Clock size={20} style={{ color: 'var(--accent)' }} /> Horários de Pico
                    </h3>
                    <div className="space-y-2">
                        {data.peakHours.slice(0, 6).map((h, i) => {
                            const max = data.peakHours[0]?.count || 1;
                            const pct = (h.count / max) * 100;
                            return (
                                <div key={i} className="flex items-center gap-3">
                                    <span className="text-sm font-medium w-12" style={{ color: 'var(--text-secondary)' }}>{h.hour}</span>
                                    <div className="flex-1 h-6 rounded-lg overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
                                            className="h-full rounded-lg"
                                            style={{ background: `linear-gradient(90deg, #2A6F7F, #7C8C6E)` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium w-8 text-right" style={{ color: 'var(--text-primary)' }}>{h.count}</span>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Quick Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="rounded-2xl p-5"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
                >
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <BarChart3 size={20} style={{ color: 'var(--accent)' }} /> Resumo Geral
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                            <div className="flex items-center gap-2">
                                <Users size={18} style={{ color: 'var(--accent)' }} />
                                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total de Clientes</span>
                            </div>
                            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{data.totalClients}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                            <div className="flex items-center gap-2">
                                <Scissors size={18} style={{ color: 'var(--olive)' }} />
                                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Serviços no Mês</span>
                            </div>
                            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                                {data.topServices.reduce((s, sv) => s + sv.count, 0)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                            <div className="flex items-center gap-2">
                                <DollarSign size={18} style={{ color: '#22C55E' }} />
                                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Ticket Médio</span>
                            </div>
                            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                                {data.topServices.length > 0
                                    ? formatCurrency(data.topServices.reduce((s, sv) => s + sv.revenue, 0) / data.topServices.reduce((s, sv) => s + sv.count, 0))
                                    : 'R$ 0'}
                            </span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

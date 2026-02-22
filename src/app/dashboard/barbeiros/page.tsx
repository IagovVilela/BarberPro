'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { UserCog, Plus, Edit2, DollarSign, Calendar, TrendingUp, X } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import { AnimatePresence } from 'framer-motion';

interface Barber {
    id: string; name: string; phone?: string; email?: string;
    specialties?: string; commission: number; active: boolean;
    stats?: { monthlyAppointments: number; monthlyRevenue: number; monthlyCommission: number };
}

export default function BarbeirosPage() {
    const { addToast } = useToast();
    const [barbers, setBarbers] = useState<Barber[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Barber | null>(null);
    const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', specialties: '', commission: 50 });

    const load = async () => {
        setLoading(true);
        const data = await fetch('/api/barbers').then(r => r.json());
        // Fetch stats for each
        const withStats = await Promise.all(data.map(async (b: Barber) => {
            const detail = await fetch(`/api/barbers/${b.id}`).then(r => r.json());
            return { ...b, stats: detail.stats };
        }));
        setBarbers(withStats);
        setLoading(false);
    };
    useEffect(() => { load(); }, []);

    const openNew = () => {
        setEditing(null);
        setFormData({ name: '', phone: '', email: '', specialties: '', commission: 50 });
        setShowModal(true);
    };

    const openEdit = (b: Barber) => {
        setEditing(b);
        setFormData({ name: b.name, phone: b.phone || '', email: b.email || '', specialties: b.specialties || '', commission: b.commission });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.name) { addToast('Nome é obrigatório', 'warning'); return; }
        const method = editing ? 'PUT' : 'POST';
        const url = editing ? `/api/barbers/${editing.id}` : '/api/barbers';
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
        if (res.ok) {
            addToast(editing ? 'Barbeiro atualizado!' : 'Barbeiro adicionado!', 'success');
            setShowModal(false); load();
        }
    };

    const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Barbeiros</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Equipe e desempenho</p>
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openNew}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-medium text-sm btn-ripple"
                    style={{ background: 'linear-gradient(135deg, #2A6F7F, #1E5A68)' }}>
                    <Plus size={18} /> Novo Barbeiro
                </motion.button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="skeleton h-64 rounded-2xl" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {barbers.map((b, i) => (
                        <motion.div key={b.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="rounded-2xl p-5 hover:shadow-md transition-all"
                            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
                                    style={{ background: 'linear-gradient(135deg, #2A6F7F, #7C8C6E)' }}>
                                    {b.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{b.name}</h3>
                                    {b.specialties && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{b.specialties}</p>}
                                    {b.phone && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{b.phone}</p>}
                                </div>
                                <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg hover:opacity-70" style={{ color: 'var(--accent)' }}>
                                    <Edit2 size={16} />
                                </button>
                            </div>

                            {b.stats && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                                        <span className="text-sm flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                                            <Calendar size={14} style={{ color: 'var(--accent)' }} /> Atendimentos
                                        </span>
                                        <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{b.stats.monthlyAppointments}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                                        <span className="text-sm flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                                            <TrendingUp size={14} style={{ color: '#22C55E' }} /> Faturamento
                                        </span>
                                        <span className="font-bold text-sm" style={{ color: '#22C55E' }}>{fmt(b.stats.monthlyRevenue)}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                                        <span className="text-sm flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                                            <DollarSign size={14} style={{ color: 'var(--olive)' }} /> Comissão ({b.commission}%)
                                        </span>
                                        <span className="font-bold text-sm" style={{ color: 'var(--olive)' }}>{fmt(b.stats.monthlyCommission)}</span>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowModal(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-x-4 top-[10%] sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg z-50 rounded-2xl p-6"
                            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{editing ? 'Editar Barbeiro' : 'Novo Barbeiro'}</h3>
                                <button onClick={() => setShowModal(false)} style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { key: 'name', label: 'Nome *', type: 'text' },
                                    { key: 'phone', label: 'Telefone', type: 'tel' },
                                    { key: 'email', label: 'Email', type: 'email' },
                                    { key: 'specialties', label: 'Especialidades', type: 'text' },
                                ].map(f => (
                                    <div key={f.key}>
                                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{f.label}</label>
                                        <input type={f.type} value={(formData as Record<string, string | number>)[f.key] as string}
                                            onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                                            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                                            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                                    </div>
                                ))}
                                <div>
                                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Comissão (%)</label>
                                    <input type="number" value={formData.commission} onChange={e => setFormData({ ...formData, commission: Number(e.target.value) })}
                                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                                        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>Cancelar</button>
                                <motion.button whileTap={{ scale: 0.98 }} onClick={handleSave}
                                    className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium btn-ripple"
                                    style={{ background: 'linear-gradient(135deg, #2A6F7F, #1E5A68)' }}>Salvar</motion.button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

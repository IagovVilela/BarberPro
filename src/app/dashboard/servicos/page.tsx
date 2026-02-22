'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, Plus, Edit2, Trash2, X, Clock, DollarSign } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

interface Service {
    id: string; name: string; duration: number; price: number;
    commission: number; category: string; active: boolean;
}

const categoryLabels: Record<string, { label: string; color: string }> = {
    corte: { label: 'Corte', color: '#2A6F7F' },
    barba: { label: 'Barba', color: '#7C8C6E' },
    combo: { label: 'Combo', color: '#D4A373' },
    tratamento: { label: 'Tratamento', color: '#E9C46A' },
};

export default function ServicosPage() {
    const { addToast } = useToast();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Service | null>(null);
    const [formData, setFormData] = useState({ name: '', duration: 30, price: 0, commission: 50, category: 'corte' });

    const load = async () => {
        setLoading(true);
        const data = await fetch('/api/services').then(r => r.json());
        setServices(data);
        setLoading(false);
    };
    useEffect(() => { load(); }, []);

    const openNew = () => {
        setEditing(null);
        setFormData({ name: '', duration: 30, price: 0, commission: 50, category: 'corte' });
        setShowModal(true);
    };

    const openEdit = (s: Service) => {
        setEditing(s);
        setFormData({ name: s.name, duration: s.duration, price: s.price, commission: s.commission, category: s.category });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.name) { addToast('Nome é obrigatório', 'warning'); return; }
        const method = editing ? 'PUT' : 'POST';
        const url = editing ? `/api/services/${editing.id}` : '/api/services';
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
        if (res.ok) {
            addToast(editing ? 'Serviço atualizado!' : 'Serviço criado!', 'success');
            setShowModal(false); load();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Excluir este serviço?')) return;
        await fetch(`/api/services/${id}`, { method: 'DELETE' });
        addToast('Serviço excluído', 'info'); load();
    };

    const grouped = services.reduce((acc, s) => {
        if (!acc[s.category]) acc[s.category] = [];
        acc[s.category].push(s);
        return acc;
    }, {} as Record<string, Service[]>);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>Serviços</h1>
                    <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>{services.length} serviços cadastrados</p>
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openNew}
                    className="flex items-center gap-2 rounded-xl text-white font-medium btn-ripple"
                    style={{ background: 'linear-gradient(135deg, #2A6F7F, #1E5A68)', padding: '12px 20px', fontSize: 14 }}>
                    <Plus size={20} /> Novo Serviço
                </motion.button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton h-40 rounded-2xl" />)}
                </div>
            ) : (
                Object.entries(grouped).map(([category, svcs]) => {
                    const cat = categoryLabels[category] || { label: category, color: '#666' };
                    return (
                        <div key={category}>
                            <h3 style={{
                                fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, color: cat.color
                            }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color }} />
                                {cat.label}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {svcs.map((s, i) => (
                                    <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        style={{
                                            borderRadius: 16, padding: 24, transition: 'box-shadow 0.2s',
                                            background: 'var(--bg-card)', border: '1px solid var(--border)'
                                        }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                                            <div style={{ padding: 12, borderRadius: 14, background: cat.color + '15' }}>
                                                <Scissors size={24} style={{ color: cat.color }} />
                                            </div>
                                            <div style={{ display: 'flex', gap: 4 }}>
                                                <button onClick={() => openEdit(s)}
                                                    style={{ padding: 8, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--accent)', transition: 'opacity 0.2s' }}
                                                    onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                                                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                                                    <Edit2 size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(s.id)}
                                                    style={{ padding: 8, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger)', transition: 'opacity 0.2s' }}
                                                    onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                                                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                        <h4 style={{ fontWeight: 600, fontSize: 16, marginBottom: 10, color: 'var(--text-primary)' }}>{s.name}</h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 18, color: 'var(--text-muted)' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}><Clock size={16} /> {s.duration}min</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}><DollarSign size={16} /> R$ {s.price.toFixed(2)}</span>
                                        </div>
                                        <p style={{ fontSize: 13, marginTop: 10, color: 'var(--text-muted)' }}>Comissão: {s.commission}%</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    );
                })
            )}

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowModal(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-x-4 top-[10%] sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg z-50 rounded-2xl"
                            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', padding: 32 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                                <h3 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>{editing ? 'Editar Serviço' : 'Novo Serviço'}</h3>
                                <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}><X size={22} /></button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Nome *</label>
                                    <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        style={{
                                            width: '100%', padding: '14px 16px', borderRadius: 14, fontSize: 14, outline: 'none',
                                            background: 'var(--bg-secondary)', border: '2px solid var(--border)', color: 'var(--text-primary)'
                                        }} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Duração (min)</label>
                                        <input type="number" value={formData.duration} onChange={e => setFormData({ ...formData, duration: Number(e.target.value) })}
                                            style={{
                                                width: '100%', padding: '14px 16px', borderRadius: 14, fontSize: 14, outline: 'none',
                                                background: 'var(--bg-secondary)', border: '2px solid var(--border)', color: 'var(--text-primary)'
                                            }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Preço (R$)</label>
                                        <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                            style={{
                                                width: '100%', padding: '14px 16px', borderRadius: 14, fontSize: 14, outline: 'none',
                                                background: 'var(--bg-secondary)', border: '2px solid var(--border)', color: 'var(--text-primary)'
                                            }} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Comissão (%)</label>
                                        <input type="number" value={formData.commission} onChange={e => setFormData({ ...formData, commission: Number(e.target.value) })}
                                            style={{
                                                width: '100%', padding: '14px 16px', borderRadius: 14, fontSize: 14, outline: 'none',
                                                background: 'var(--bg-secondary)', border: '2px solid var(--border)', color: 'var(--text-primary)'
                                            }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Categoria</label>
                                        <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            style={{
                                                width: '100%', padding: '14px 16px', borderRadius: 14, fontSize: 14, outline: 'none',
                                                background: 'var(--bg-secondary)', border: '2px solid var(--border)', color: 'var(--text-primary)'
                                            }}>
                                            <option value="corte">Corte</option>
                                            <option value="barba">Barba</option>
                                            <option value="combo">Combo</option>
                                            <option value="tratamento">Tratamento</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
                                <button onClick={() => setShowModal(false)}
                                    style={{
                                        flex: 1, padding: '14px 0', borderRadius: 14, fontSize: 14, fontWeight: 600,
                                        background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer'
                                    }}>Cancelar</button>
                                <motion.button whileTap={{ scale: 0.98 }} onClick={handleSave}
                                    className="btn-ripple"
                                    style={{
                                        flex: 1, padding: '14px 0', borderRadius: 14, fontSize: 14, fontWeight: 600,
                                        background: 'linear-gradient(135deg, #2A6F7F, #1E5A68)', color: '#fff', border: 'none', cursor: 'pointer'
                                    }}>Salvar</motion.button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

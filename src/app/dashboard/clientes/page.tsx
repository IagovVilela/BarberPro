'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Plus, Phone, Star, Edit2, Trash2, X, Award } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

interface Client {
    id: string; name: string; phone?: string; whatsapp?: string;
    birthDate?: string; notes?: string; loyaltyPoints: number;
    totalVisits: number; createdAt: string;
}

export default function ClientesPage() {
    const { addToast } = useToast();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Client | null>(null);
    const [formData, setFormData] = useState({ name: '', phone: '', whatsapp: '', birthDate: '', notes: '' });

    const loadClients = async (q = '') => {
        setLoading(true);
        const data = await fetch(`/api/clients?search=${q}&limit=100`).then(r => r.json());
        setClients(data.clients || []);
        setLoading(false);
    };

    useEffect(() => { loadClients(); }, []);

    useEffect(() => {
        const timer = setTimeout(() => loadClients(search), 300);
        return () => clearTimeout(timer);
    }, [search]);

    const openNew = () => {
        setEditing(null);
        setFormData({ name: '', phone: '', whatsapp: '', birthDate: '', notes: '' });
        setShowModal(true);
    };

    const openEdit = (c: Client) => {
        setEditing(c);
        setFormData({ name: c.name, phone: c.phone || '', whatsapp: c.whatsapp || '', birthDate: c.birthDate || '', notes: c.notes || '' });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.name) { addToast('Nome é obrigatório', 'warning'); return; }
        const method = editing ? 'PUT' : 'POST';
        const url = editing ? `/api/clients/${editing.id}` : '/api/clients';
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
        if (res.ok) {
            addToast(editing ? 'Cliente atualizado!' : 'Cliente cadastrado!', 'success');
            setShowModal(false);
            loadClients(search);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Excluir este cliente?')) return;
        await fetch(`/api/clients/${id}`, { method: 'DELETE' });
        addToast('Cliente excluído', 'info');
        loadClients(search);
    };

    const topClients = [...clients].sort((a, b) => b.totalVisits - a.totalVisits).slice(0, 5);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Clientes</h1>
                    <p style={{ color: 'var(--text-muted)' }}>{clients.length} clientes cadastrados</p>
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openNew}
                    className="flex items-center gap-2 rounded-xl text-white font-medium btn-ripple"
                    style={{ background: 'linear-gradient(135deg, #2A6F7F, #1E5A68)', padding: '12px 20px', fontSize: 14 }}>
                    <Plus size={20} /> Novo Cliente
                </motion.button>
            </div>

            {/* Search */}
            <div style={{ position: 'relative' }}>
                <Search size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome, telefone..."
                    style={{
                        width: '100%', paddingLeft: 48, paddingRight: 16, paddingTop: 14, paddingBottom: 14,
                        borderRadius: 14, fontSize: 14, outline: 'none',
                        background: 'var(--bg-card)', border: '2px solid var(--border)', color: 'var(--text-primary)'
                    }} />
            </div>

            {/* Top Clients */}
            {!search && topClients.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <Award size={20} style={{ color: 'var(--accent)' }} /> Clientes Mais Frequentes
                    </h3>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {topClients.map((c, i) => (
                            <div key={c.id} style={{
                                flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12,
                                padding: '12px 18px', borderRadius: 14, minWidth: 220, background: 'var(--bg-secondary)'
                            }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: '50%', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700,
                                    color: '#fff', background: ['#2A6F7F', '#7C8C6E', '#D4A373', '#E9C46A', '#264653'][i]
                                }}>
                                    {i + 1}
                                </div>
                                <div>
                                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</p>
                                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{c.totalVisits} visitas • {c.loyaltyPoints} pts</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Client List */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                {loading ? (
                    <div className="p-6 space-y-3">
                        {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
                    </div>
                ) : clients.length === 0 ? (
                    <div className="p-12 text-center">
                        <Users size={56} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                        <p style={{ fontSize: 18, fontWeight: 500, color: 'var(--text-secondary)' }}>Nenhum cliente encontrado</p>
                    </div>
                ) : (
                    <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                        {clients.map((client, i) => (
                            <motion.div key={client.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                                style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px' }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: '50%', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700,
                                    color: '#fff', flexShrink: 0, background: 'linear-gradient(135deg, #2A6F7F, #7C8C6E)'
                                }}>
                                    {client.name.charAt(0)}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client.name}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 4 }}>
                                        {client.phone && (
                                            <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)' }}>
                                                <Phone size={14} /> {client.phone}
                                            </span>
                                        )}
                                        <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 5, color: 'var(--olive)' }}>
                                            <Star size={14} /> {client.loyaltyPoints} pts
                                        </span>
                                    </div>
                                </div>
                                <span className="hidden sm:block" style={{ fontSize: 13, color: 'var(--text-muted)' }}>{client.totalVisits} visitas</span>
                                <div style={{ display: 'flex', gap: 4 }}>
                                    <button onClick={() => openEdit(client)}
                                        style={{ padding: 8, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--accent)', transition: 'opacity 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                                        <Edit2 size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(client.id)}
                                        style={{ padding: 8, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger)', transition: 'opacity 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

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
                                <h3 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>{editing ? 'Editar Cliente' : 'Novo Cliente'}</h3>
                                <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}><X size={22} /></button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                {[
                                    { key: 'name', label: 'Nome *', type: 'text', ph: 'Nome completo' },
                                    { key: 'phone', label: 'Telefone', type: 'tel', ph: '(00) 00000-0000' },
                                    { key: 'whatsapp', label: 'WhatsApp', type: 'tel', ph: '(00) 00000-0000' },
                                    { key: 'birthDate', label: 'Data de Nascimento', type: 'date', ph: '' },
                                ].map(f => (
                                    <div key={f.key}>
                                        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>{f.label}</label>
                                        <input type={f.type} value={(formData as Record<string, string>)[f.key]} placeholder={f.ph}
                                            onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                                            style={{
                                                width: '100%', padding: '14px 16px', borderRadius: 14, fontSize: 14, outline: 'none',
                                                background: 'var(--bg-secondary)', border: '2px solid var(--border)', color: 'var(--text-primary)'
                                            }} />
                                    </div>
                                ))}
                                <div>
                                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Observações</label>
                                    <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                        rows={3} style={{
                                            width: '100%', padding: '14px 16px', borderRadius: 14, fontSize: 14, outline: 'none', resize: 'none',
                                            background: 'var(--bg-secondary)', border: '2px solid var(--border)', color: 'var(--text-primary)'
                                        }} />
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

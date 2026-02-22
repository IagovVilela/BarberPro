'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Plus, Edit2, Trash2, X, AlertTriangle, Search } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

interface Product {
    id: string; name: string; description?: string; quantity: number;
    minQuantity: number; price: number; category: string;
}

export default function EstoquePage() {
    const { addToast } = useToast();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Product | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '', quantity: 0, minQuantity: 5, price: 0, category: '' });

    const load = async (q = '') => {
        setLoading(true);
        const data = await fetch(`/api/inventory?search=${q}`).then(r => r.json());
        setProducts(data);
        setLoading(false);
    };
    useEffect(() => { load(); }, []);
    useEffect(() => { const t = setTimeout(() => load(search), 300); return () => clearTimeout(t); }, [search]);

    const openNew = () => { setEditing(null); setFormData({ name: '', description: '', quantity: 0, minQuantity: 5, price: 0, category: '' }); setShowModal(true); };
    const openEdit = (p: Product) => { setEditing(p); setFormData({ name: p.name, description: p.description || '', quantity: p.quantity, minQuantity: p.minQuantity, price: p.price, category: p.category }); setShowModal(true); };

    const handleSave = async () => {
        if (!formData.name) { addToast('Nome obrigatório', 'warning'); return; }
        const method = editing ? 'PUT' : 'POST';
        const url = editing ? `/api/inventory/${editing.id}` : '/api/inventory';
        await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
        addToast(editing ? 'Produto atualizado!' : 'Produto cadastrado!', 'success');
        setShowModal(false); load(search);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Excluir produto?')) return;
        await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
        addToast('Produto excluído', 'info'); load(search);
    };

    const lowStock = products.filter(p => p.quantity <= p.minQuantity);
    const fmt = (v: number) => `R$ ${v.toFixed(2)}`;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Estoque</h1>
                    <p style={{ color: 'var(--text-muted)' }}>{products.length} produtos</p>
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openNew}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-medium text-sm btn-ripple"
                    style={{ background: 'linear-gradient(135deg, #2A6F7F, #1E5A68)' }}>
                    <Plus size={18} /> Novo Produto
                </motion.button>
            </div>

            <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar produto..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
            </div>

            {lowStock.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl p-4"
                    style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: '#EF4444' }}>
                        <AlertTriangle size={16} /> Estoque Baixo ({lowStock.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {lowStock.map(p => (
                            <span key={p.id} className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
                                {p.name}: {p.quantity} un.
                            </span>
                        ))}
                    </div>
                </motion.div>
            )}

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton h-36 rounded-2xl" />)}
                </div>
            ) : products.length === 0 ? (
                <div className="rounded-2xl p-12 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <Package size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                    <p style={{ color: 'var(--text-secondary)' }}>Nenhum produto encontrado</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((p, i) => {
                        const isLow = p.quantity <= p.minQuantity;
                        return (
                            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                className="rounded-2xl p-5 hover:shadow-md transition-all"
                                style={{ background: 'var(--bg-card)', border: `1px solid ${isLow ? 'rgba(239,68,68,0.3)' : 'var(--border)'}` }}>
                                <div className="flex items-start justify-between mb-3">
                                    <div className="p-2 rounded-xl" style={{ background: isLow ? 'rgba(239,68,68,0.1)' : 'rgba(42,111,127,0.1)' }}>
                                        <Package size={20} style={{ color: isLow ? '#EF4444' : 'var(--accent)' }} />
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:opacity-70" style={{ color: 'var(--accent)' }}><Edit2 size={14} /></button>
                                        <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:opacity-70" style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>
                                    </div>
                                </div>
                                <h4 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{p.name}</h4>
                                {p.description && <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{p.description}</p>}
                                {p.category && <span className="text-xs px-2 py-0.5 rounded-full mb-2 inline-block" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>{p.category}</span>}
                                <div className="flex justify-between items-center mt-2">
                                    <span className={`text-sm font-bold ${isLow ? 'text-red-500' : ''}`} style={isLow ? {} : { color: 'var(--text-primary)' }}>
                                        {p.quantity} un.
                                    </span>
                                    <span className="text-sm font-medium" style={{ color: 'var(--accent)' }}>{fmt(p.price)}</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            <AnimatePresence>{showModal && (<>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowModal(false)} />
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="fixed inset-x-4 top-[10%] sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg z-50 rounded-2xl p-6"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{editing ? 'Editar Produto' : 'Novo Produto'}</h3>
                        <button onClick={() => setShowModal(false)} style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
                    </div>
                    <div className="space-y-4">
                        <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Nome *</label>
                            <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} /></div>
                        <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Descrição</label>
                            <input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} /></div>
                        <div className="grid grid-cols-3 gap-4">
                            <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Qtd</label>
                                <input type="number" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} /></div>
                            <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Mín</label>
                                <input type="number" value={formData.minQuantity} onChange={e => setFormData({ ...formData, minQuantity: Number(e.target.value) })} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} /></div>
                            <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Preço</label>
                                <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} /></div>
                        </div>
                        <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Categoria</label>
                            <input value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} /></div>
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>Cancelar</button>
                        <motion.button whileTap={{ scale: 0.98 }} onClick={handleSave} className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium btn-ripple"
                            style={{ background: 'linear-gradient(135deg, #2A6F7F, #1E5A68)' }}>Salvar</motion.button>
                    </div>
                </motion.div></>)}</AnimatePresence>
        </div>
    );
}

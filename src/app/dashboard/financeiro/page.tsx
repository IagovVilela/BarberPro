'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DollarSign, TrendingUp, Plus, ArrowUpCircle,
    ArrowDownCircle, FileText, X, Download
} from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from 'recharts';

interface Transaction {
    id: string; type: string; category: string; description: string;
    amount: number; paymentMethod?: string; createdAt: string;
    barber?: { name: string };
}
interface Summary { income: number; expenses: number; profit: number; }
const COLORS = ['#2A6F7F', '#7C8C6E', '#D4A373', '#E9C46A', '#264653'];

export default function FinanceiroPage() {
    const { addToast } = useToast();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [summary, setSummary] = useState<Summary>({ income: 0, expenses: 0, profit: 0 });
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [startDate, setStartDate] = useState(() => {
        const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [formData, setFormData] = useState({
        type: 'entrada', category: 'servico', description: '', amount: 0, paymentMethod: 'dinheiro',
    });

    const load = async () => {
        setLoading(true);
        const data = await fetch(`/api/financial?startDate=${startDate}&endDate=${endDate}`).then(r => r.json());
        setTransactions(data.transactions || []);
        setSummary(data.summary || { income: 0, expenses: 0, profit: 0 });
        setLoading(false);
    };
    useEffect(() => { load(); }, [startDate, endDate]);

    const handleSave = async () => {
        if (!formData.description || !formData.amount) { addToast('Preencha todos os campos', 'warning'); return; }
        await fetch('/api/financial', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
        addToast('Transação registrada!', 'success');
        setShowModal(false); load();
    };

    const exportPDF = async () => {
        try {
            const jspdfModule = await import('jspdf');
            const jsPDF = jspdfModule.default || jspdfModule.jsPDF;
            if (!jsPDF) { addToast('Erro ao carregar jsPDF', 'error'); return; }
            const autoTableModule = await import('jspdf-autotable');
            const autoTable = autoTableModule.default;
            const doc = new jsPDF();
            doc.setFontSize(18); doc.text('Relatório Financeiro - BarberPro', 14, 22);
            doc.setFontSize(11); doc.text(`Período: ${startDate} a ${endDate}`, 14, 32);
            doc.text(`Receitas: R$ ${summary.income.toFixed(2)}`, 14, 45);
            doc.text(`Despesas: R$ ${summary.expenses.toFixed(2)}`, 14, 53);
            doc.text(`Lucro: R$ ${summary.profit.toFixed(2)}`, 14, 61);
            const rows = transactions.map((t: Transaction) => [
                new Date(t.createdAt).toLocaleDateString('pt-BR'), t.type === 'entrada' ? 'Entrada' : 'Saída',
                t.category, t.description, t.paymentMethod || '-', `R$ ${t.amount.toFixed(2)}`]);

            autoTable(doc, {
                startY: 70, head: [['Data', 'Tipo', 'Categoria', 'Descrição', 'Pagamento', 'Valor']], body: rows, styles: { fontSize: 9 }
            });
            doc.save(`relatorio-${startDate}-${endDate}.pdf`);
            addToast('PDF exportado!', 'success');
        } catch (err) {
            console.error('PDF export error:', err);
            addToast('Erro ao exportar PDF', 'error');
        }
    };

    const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
    const catData = transactions.reduce((a, t) => {
        const e = a.find(x => x.name === t.category);
        if (e) e.value += t.amount;
        else a.push({ name: t.category, value: t.amount });
        return a;
    }, [] as { name: string; value: number }[]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Financeiro</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Controle de caixa e relatórios</p>
                </div>
                <div className="flex gap-2">
                    <motion.button whileTap={{ scale: 0.98 }} onClick={exportPDF}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm"
                        style={{ background: 'var(--olive-light)', color: 'var(--olive)' }}>
                        <Download size={16} /> PDF
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-medium text-sm btn-ripple"
                        style={{ background: 'linear-gradient(135deg, #2A6F7F, #1E5A68)' }}>
                        <Plus size={18} /> Nova Transação
                    </motion.button>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 p-4 rounded-2xl"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2">
                    <label className="text-sm" style={{ color: 'var(--text-secondary)' }}>De:</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="px-3 py-2 rounded-xl text-sm outline-none"
                        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm" style={{ color: 'var(--text-secondary)' }}>Até:</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="px-3 py-2 rounded-xl text-sm outline-none"
                        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { icon: ArrowUpCircle, label: 'Receitas', value: summary.income, color: '#22C55E' },
                    { icon: ArrowDownCircle, label: 'Despesas', value: summary.expenses, color: '#EF4444' },
                    { icon: TrendingUp, label: 'Lucro Líquido', value: summary.profit, color: 'var(--accent)' },
                ].map((c, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                        <div className="flex items-center gap-2 mb-2">
                            <c.icon size={20} style={{ color: c.color }} />
                            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{c.label}</span>
                        </div>
                        <p className="text-2xl font-bold" style={{ color: c.color }}>{fmt(c.value)}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {catData.length > 0 && (
                    <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Por Categoria</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart><Pie data={catData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={5}>
                                {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie>
                                <Tooltip formatter={(v: number | undefined) => fmt(v ?? 0)} /></PieChart>
                        </ResponsiveContainer>
                        <div className="mt-2 space-y-1">{catData.map((c, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs">
                                <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                                <span style={{ color: 'var(--text-secondary)' }}>{c.name}: {fmt(c.value)}</span>
                            </div>))}</div>
                    </div>
                )}

                <div className={`rounded-2xl overflow-hidden ${catData.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'}`}
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
                        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Transações</h3>
                    </div>
                    {loading ? <div className="p-6 space-y-3">{[1, 2, 3].map(i => <div key={i} className="skeleton h-12 rounded-xl" />)}</div>
                        : transactions.length === 0 ? <div className="p-12 text-center"><FileText size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} /><p style={{ color: 'var(--text-secondary)' }}>Nenhuma transação</p></div>
                            : <div className="divide-y max-h-96 overflow-y-auto" style={{ borderColor: 'var(--border)' }}>
                                {transactions.map((t, i) => (
                                    <motion.div key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                                        className="flex items-center gap-4 p-4">
                                        <div className="p-2 rounded-xl" style={{ background: t.type === 'entrada' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)' }}>
                                            {t.type === 'entrada' ? <ArrowUpCircle size={18} style={{ color: '#22C55E' }} /> : <ArrowDownCircle size={18} style={{ color: '#EF4444' }} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{t.description}</p>
                                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.category} {t.paymentMethod ? `• ${t.paymentMethod}` : ''}</p>
                                        </div>
                                        <span className="font-semibold text-sm" style={{ color: t.type === 'entrada' ? '#22C55E' : '#EF4444' }}>
                                            {t.type === 'entrada' ? '+' : '-'} {fmt(t.amount)}
                                        </span>
                                    </motion.div>))}
                            </div>}
                </div>
            </div>

            <AnimatePresence>{showModal && (<>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowModal(false)} />
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="fixed inset-x-4 top-[10%] sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg z-50 rounded-2xl p-6"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Nova Transação</h3>
                        <button onClick={() => setShowModal(false)} style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
                    </div>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Tipo</label>
                                <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                                    <option value="entrada">Entrada</option><option value="saida">Saída</option></select></div>
                            <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Categoria</label>
                                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                                    <option value="servico">Serviço</option><option value="produto">Produto</option><option value="despesa">Despesa</option><option value="outros">Outros</option></select></div>
                        </div>
                        <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Descrição *</label>
                            <input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Valor (R$)</label>
                                <input type="number" step="0.01" value={formData.amount} onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} /></div>
                            <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Pagamento</label>
                                <select value={formData.paymentMethod} onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                                    <option value="dinheiro">Dinheiro</option><option value="pix">PIX</option><option value="cartao_credito">Cartão Crédito</option><option value="cartao_debito">Cartão Débito</option></select></div>
                        </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>Cancelar</button>
                        <motion.button whileTap={{ scale: 0.98 }} onClick={handleSave} className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium btn-ripple" style={{ background: 'linear-gradient(135deg, #2A6F7F, #1E5A68)' }}>Salvar</motion.button>
                    </div>
                </motion.div></>)}</AnimatePresence>
        </div>
    );
}

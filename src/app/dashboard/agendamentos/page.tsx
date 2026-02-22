'use client';
import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, ChevronLeft, ChevronRight, Plus, Clock, User,
    Scissors, Filter, Check, X, AlertCircle, Search
} from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

interface Appointment {
    id: string;
    date: string;
    time: string;
    status: string;
    price: number;
    notes?: string;
    client: { id: string; name: string; phone?: string };
    service: { id: string; name: string; duration: number; price: number };
    barber: { id: string; name: string };
}

interface Service { id: string; name: string; duration: number; price: number; category: string; }
interface Barber { id: string; name: string; }
interface Client { id: string; name: string; phone?: string; }

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    pendente: { label: 'Pendente', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    confirmado: { label: 'Confirmado', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
    concluido: { label: 'Concluído', color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
    cancelado: { label: 'Cancelado', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
};

const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
];

export default function AgendamentosPage() {
    const { addToast } = useToast();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [barbers, setBarbers] = useState<Barber[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<'day' | 'week' | 'month'>('day');
    const [filterBarberId, setFilterBarberId] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
    const [formData, setFormData] = useState({
        clientId: '', serviceId: '', barberId: '', date: '', time: '', notes: '', price: 0,
    });

    const dateStr = currentDate.toISOString().split('T')[0];

    useEffect(() => {
        Promise.all([
            fetch('/api/services').then(r => r.json()),
            fetch('/api/barbers').then(r => r.json()),
            fetch('/api/clients?limit=100').then(r => r.json()),
        ]).then(([svcs, brbs, clts]) => {
            setServices(svcs);
            setBarbers(brbs);
            setClients(clts.clients || clts);
        });
    }, []);

    useEffect(() => {
        setLoading(true);
        const url = filterBarberId
            ? `/api/appointments?date=${dateStr}&barberId=${filterBarberId}`
            : `/api/appointments?date=${dateStr}`;
        fetch(url)
            .then(r => r.json())
            .then(data => { setAppointments(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [dateStr, filterBarberId]);

    const navigate = (dir: number) => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() + dir);
        setCurrentDate(d);
    };

    const openNewModal = () => {
        setEditingAppointment(null);
        setFormData({ clientId: '', serviceId: '', barberId: '', date: dateStr, time: '09:00', notes: '', price: 0 });
        setShowModal(true);
    };

    const handleServiceChange = (serviceId: string) => {
        const svc = services.find(s => s.id === serviceId);
        setFormData(prev => ({ ...prev, serviceId, price: svc?.price || 0 }));
    };

    const handleSave = async () => {
        if (!formData.clientId || !formData.serviceId || !formData.barberId) {
            addToast('Preencha todos os campos', 'warning');
            return;
        }

        const method = editingAppointment ? 'PUT' : 'POST';
        const url = editingAppointment
            ? `/api/appointments/${editingAppointment.id}`
            : '/api/appointments';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        if (res.status === 409) {
            addToast('Conflito de horário! Este barbeiro já tem agendamento neste horário.', 'error');
            return;
        }

        if (res.ok) {
            addToast(editingAppointment ? 'Agendamento atualizado!' : 'Agendamento criado!', 'success');
            setShowModal(false);
            // Reload
            const data = await fetch(`/api/appointments?date=${dateStr}`).then(r => r.json());
            setAppointments(data);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        await fetch(`/api/appointments/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        addToast(`Status atualizado para ${statusConfig[status]?.label}`, 'success');
        const data = await fetch(`/api/appointments?date=${dateStr}`).then(r => r.json());
        setAppointments(data);
    };

    const formatDate = (d: Date) => d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <p style={{ fontSize: 28, fontWeight: 700, marginBottom: 4, color: 'var(--text-primary)' }}>Agendamentos</p>
                    <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Gerencie a agenda da barbearia</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={openNewModal}
                    className="flex items-center gap-2 rounded-xl text-white font-medium btn-ripple"
                    style={{ background: 'linear-gradient(135deg, #2A6F7F, #1E5A68)', padding: '12px 20px', fontSize: 14 }}
                >
                    <Plus size={20} /> Novo Agendamento
                </motion.button>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:opacity-70 transition" style={{ color: 'var(--text-secondary)' }}>
                        <ChevronLeft size={20} />
                    </button>
                    <h2 className="text-lg font-semibold capitalize min-w-[280px] text-center" style={{ color: 'var(--text-primary)' }}>
                        {formatDate(currentDate)}
                    </h2>
                    <button onClick={() => navigate(1)} className="p-2 rounded-lg hover:opacity-70 transition" style={{ color: 'var(--text-secondary)' }}>
                        <ChevronRight size={20} />
                    </button>
                </div>

                <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition"
                    style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
                >
                    Hoje
                </button>

                <div className="flex items-center gap-2 ml-auto">
                    <Filter size={18} style={{ color: 'var(--text-muted)' }} />
                    <select
                        value={filterBarberId}
                        onChange={(e) => setFilterBarberId(e.target.value)}
                        style={{
                            fontSize: 14, padding: '8px 14px', borderRadius: 10, outline: 'none',
                            background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)'
                        }}
                    >
                        <option value="">Todos os barbeiros</option>
                        {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                </div>
            </div>

            {/* Timeline */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                {loading ? (
                    <div className="p-8 space-y-3">
                        {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="p-12 text-center">
                        <Calendar size={56} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                        <p style={{ fontSize: 18, fontWeight: 500, color: 'var(--text-secondary)' }}>Nenhum agendamento para este dia</p>
                        <p style={{ fontSize: 14, marginTop: 6, color: 'var(--text-muted)' }}>Clique em &quot;Novo Agendamento&quot; para adicionar</p>
                    </div>
                ) : (
                    <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                        {appointments.map((appt, i) => {
                            const sc = statusConfig[appt.status] || statusConfig.pendente;
                            return (
                                <motion.div
                                    key={appt.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', transition: 'opacity 0.2s' }}
                                >
                                    <div style={{ textAlign: 'center', minWidth: 64 }}>
                                        <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>{appt.time}</p>
                                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{appt.service.duration}min</p>
                                    </div>
                                    <div style={{ width: 4, height: 48, borderRadius: 4, background: sc.color, flexShrink: 0 }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{appt.client.name}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                            <Scissors size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                                            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{appt.service.name}</span>
                                            <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>•</span>
                                            <User size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                                            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{appt.barber.name}</span>
                                        </div>
                                    </div>
                                    <span className="hidden sm:block"
                                        style={{ fontSize: 13, fontWeight: 600, padding: '6px 12px', borderRadius: 8, background: sc.bg, color: sc.color }}>
                                        {sc.label}
                                    </span>
                                    <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--accent)', whiteSpace: 'nowrap' }}>
                                        R$ {appt.price.toFixed(2)}
                                    </span>
                                    <div className="flex gap-1">
                                        {appt.status !== 'concluido' && appt.status !== 'cancelado' && (
                                            <>
                                                <button onClick={() => updateStatus(appt.id, 'concluido')}
                                                    style={{ padding: 8, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', transition: 'opacity 0.2s' }}
                                                    onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                                                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                                    title="Concluir">
                                                    <Check size={20} style={{ color: '#22C55E' }} />
                                                </button>
                                                <button onClick={() => updateStatus(appt.id, 'cancelado')}
                                                    style={{ padding: 8, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', transition: 'opacity 0.2s' }}
                                                    onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                                                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                                    title="Cancelar">
                                                    <X size={20} style={{ color: '#EF4444' }} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowModal(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed inset-x-4 top-[10%] sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg z-50 rounded-2xl max-h-[80vh] overflow-y-auto"
                            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', padding: 32 }}
                        >
                            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, color: 'var(--text-primary)' }}>
                                {editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Cliente</label>
                                    <select value={formData.clientId} onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                                        style={{
                                            width: '100%', padding: '14px 16px', borderRadius: 14, fontSize: 14, outline: 'none',
                                            background: 'var(--bg-secondary)', border: '2px solid var(--border)', color: 'var(--text-primary)'
                                        }}>
                                        <option value="">Selecione o cliente</option>
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Serviço</label>
                                    <select value={formData.serviceId} onChange={e => handleServiceChange(e.target.value)}
                                        style={{
                                            width: '100%', padding: '14px 16px', borderRadius: 14, fontSize: 14, outline: 'none',
                                            background: 'var(--bg-secondary)', border: '2px solid var(--border)', color: 'var(--text-primary)'
                                        }}>
                                        <option value="">Selecione o serviço</option>
                                        {services.map(s => <option key={s.id} value={s.id}>{s.name} - R$ {s.price.toFixed(2)} ({s.duration}min)</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Barbeiro</label>
                                    <select value={formData.barberId} onChange={e => setFormData({ ...formData, barberId: e.target.value })}
                                        style={{
                                            width: '100%', padding: '14px 16px', borderRadius: 14, fontSize: 14, outline: 'none',
                                            background: 'var(--bg-secondary)', border: '2px solid var(--border)', color: 'var(--text-primary)'
                                        }}>
                                        <option value="">Selecione o barbeiro</option>
                                        {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Data</label>
                                        <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })}
                                            style={{
                                                width: '100%', padding: '14px 16px', borderRadius: 14, fontSize: 14, outline: 'none',
                                                background: 'var(--bg-secondary)', border: '2px solid var(--border)', color: 'var(--text-primary)'
                                            }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Horário</label>
                                        <select value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })}
                                            style={{
                                                width: '100%', padding: '14px 16px', borderRadius: 14, fontSize: 14, outline: 'none',
                                                background: 'var(--bg-secondary)', border: '2px solid var(--border)', color: 'var(--text-primary)'
                                            }}>
                                            {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Observações</label>
                                    <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                        rows={3} placeholder="Observações opcionais..."
                                        style={{
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
                                    }}>
                                    Cancelar
                                </button>
                                <motion.button whileTap={{ scale: 0.98 }} onClick={handleSave}
                                    className="btn-ripple"
                                    style={{
                                        flex: 1, padding: '14px 0', borderRadius: 14, fontSize: 14, fontWeight: 600,
                                        background: 'linear-gradient(135deg, #2A6F7F, #1E5A68)', color: '#fff', border: 'none', cursor: 'pointer'
                                    }}>
                                    Salvar
                                </motion.button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

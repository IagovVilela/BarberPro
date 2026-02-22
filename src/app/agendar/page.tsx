'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, Clock, DollarSign, ChevronLeft, ChevronRight, User, Phone, Check, Calendar, MapPin } from 'lucide-react';

interface Service { id: string; name: string; duration: number; price: number; category: string; }
interface BarberSlot { id: string; name: string; specialties: string | null; availableSlots: string[]; }
interface BookingResult { id: string; date: string; time: string; service: string; barber: string; price: number; client: string; }

const STEPS = ['Serviço', 'Data', 'Horário', 'Confirmar'];

export default function AgendarPage() {
    const [step, setStep] = useState(0);
    const [services, setServices] = useState<Service[]>([]);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [barbers, setBarbers] = useState<BarberSlot[]>([]);
    const [selectedBarber, setSelectedBarber] = useState<BarberSlot | null>(null);
    const [selectedTime, setSelectedTime] = useState('');
    const [clientName, setClientName] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);
    const [error, setError] = useState('');

    // Load services on mount
    useEffect(() => {
        fetch('/api/services').then(r => r.json()).then(setServices);
    }, []);

    // Load availability when date + service selected
    useEffect(() => {
        if (selectedDate && selectedService) {
            setLoadingSlots(true);
            setBarbers([]); setSelectedBarber(null); setSelectedTime('');
            fetch(`/api/public/availability?date=${selectedDate}&serviceId=${selectedService.id}`)
                .then(r => r.json())
                .then(data => { setBarbers(data.barbers || []); setLoadingSlots(false); });
        }
    }, [selectedDate, selectedService]);

    // Generate next 30 days
    const dates: { label: string; value: string; weekday: string; dayNum: number }[] = [];
    for (let i = 0; i < 30; i++) {
        const d = new Date(); d.setDate(d.getDate() + i);
        const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        dates.push({
            label: d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
            value: d.toISOString().split('T')[0],
            weekday: weekdays[d.getDay()],
            dayNum: d.getDate(),
        });
    }

    const handleSubmit = async () => {
        if (!clientName || !clientPhone) { setError('Preencha nome e telefone'); return; }
        setError(''); setSubmitting(true);
        const res = await fetch('/api/public/booking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: clientName, phone: clientPhone,
                serviceId: selectedService!.id, barberId: selectedBarber!.id,
                date: selectedDate, time: selectedTime,
            }),
        });
        const data = await res.json();
        setSubmitting(false);
        if (res.ok) { setBookingResult(data.appointment); setStep(4); }
        else { setError(data.error || 'Erro ao agendar'); }
    };

    const fmt = (v: number) => `R$ ${v.toFixed(2)}`;

    const canNext = () => {
        if (step === 0) return !!selectedService;
        if (step === 1) return !!selectedDate;
        if (step === 2) return !!selectedBarber && !!selectedTime;
        if (step === 3) return !!clientName && !!clientPhone;
        return false;
    };

    // Success screen
    if (step === 4 && bookingResult) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    style={{ maxWidth: 440, width: '100%', textAlign: 'center' }}>
                    <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
                        style={{
                            width: 80, height: 80, borderRadius: '50%', margin: '0 auto 24px',
                            background: 'linear-gradient(135deg, #22C55E, #16A34A)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 8px 30px rgba(34,197,94,0.3)',
                        }}>
                        <Check size={40} color="#fff" />
                    </motion.div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                        Agendamento Confirmado!
                    </h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>Seu horário foi reservado com sucesso</p>

                    <div style={{
                        background: 'var(--bg-card)', borderRadius: 20, padding: 24,
                        border: '1px solid var(--border)', textAlign: 'left',
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {[
                                { icon: Scissors, label: 'Serviço', value: bookingResult.service },
                                { icon: Calendar, label: 'Data', value: new Date(bookingResult.date + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }) },
                                { icon: Clock, label: 'Horário', value: bookingResult.time },
                                { icon: User, label: 'Barbeiro', value: bookingResult.barber },
                                { icon: DollarSign, label: 'Valor', value: fmt(bookingResult.price) },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{
                                        width: 40, height: 40, borderRadius: 12, display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        background: 'var(--accent-light)',
                                    }}>
                                        <item.icon size={18} style={{ color: 'var(--accent)' }} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.label}</div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{item.value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <motion.button whileTap={{ scale: 0.98 }}
                        onClick={() => { setStep(0); setSelectedService(null); setSelectedDate(''); setSelectedBarber(null); setSelectedTime(''); setBookingResult(null); }}
                        style={{
                            marginTop: 24, width: '100%', padding: '14px 0', borderRadius: 16,
                            background: 'linear-gradient(135deg, #2A6F7F, #1E5A68)',
                            color: '#fff', fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer',
                        }}>
                        Fazer Novo Agendamento
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #1E2A2E 0%, #2A6F7F 100%)',
                padding: '32px 24px 48px', textAlign: 'center',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
                    <Scissors size={24} color="#fff" />
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>
                        Barber<span style={{ color: '#7BCED9' }}>Pro</span>
                    </h1>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Agende seu horário online</p>
            </div>

            {/* Stepper */}
            <div style={{
                maxWidth: 600, margin: '-28px auto 0', padding: '0 16px',
                position: 'relative', zIndex: 10,
            }}>
                <div style={{
                    background: 'var(--bg-card)', borderRadius: 20, padding: '16px 20px',
                    border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    {STEPS.map((s, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: '50%', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
                                background: i <= step ? 'linear-gradient(135deg, #2A6F7F, #1E5A68)' : 'var(--bg-secondary)',
                                color: i <= step ? '#fff' : 'var(--text-muted)',
                                transition: 'all 0.3s',
                            }}>
                                {i < step ? <Check size={14} /> : i + 1}
                            </div>
                            <span style={{
                                fontSize: 12, fontWeight: i === step ? 600 : 400,
                                color: i <= step ? 'var(--accent)' : 'var(--text-muted)',
                                display: 'none',
                            }} className="sm:!inline">{s}</span>
                            {i < STEPS.length - 1 && (
                                <div style={{
                                    width: 24, height: 2, borderRadius: 1, marginLeft: 4,
                                    background: i < step ? 'var(--accent)' : 'var(--border)',
                                    transition: 'all 0.3s',
                                }} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div style={{ maxWidth: 600, margin: '24px auto', padding: '0 16px' }}>
                <AnimatePresence mode="wait">
                    {/* Step 0: Select Service */}
                    {step === 0 && (
                        <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                                Escolha o serviço
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
                                Selecione o que você deseja fazer
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {services.map(s => {
                                    const isSelected = selectedService?.id === s.id;
                                    return (
                                        <motion.div key={s.id} whileTap={{ scale: 0.98 }}
                                            onClick={() => setSelectedService(s)}
                                            style={{
                                                padding: 16, borderRadius: 16, cursor: 'pointer',
                                                background: 'var(--bg-card)',
                                                border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                                                boxShadow: isSelected ? '0 0 0 4px var(--accent-light)' : 'none',
                                                transition: 'all 0.2s',
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{
                                                    width: 44, height: 44, borderRadius: 12,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    background: isSelected ? 'var(--accent)' : 'var(--accent-light)',
                                                    transition: 'all 0.2s',
                                                }}>
                                                    <Scissors size={20} color={isSelected ? '#fff' : 'var(--accent)'} style={{ color: isSelected ? '#fff' : 'var(--accent)' }} />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</div>
                                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={12} /> {s.duration}min</span>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><DollarSign size={12} /> {fmt(s.price)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                                    style={{
                                                        width: 24, height: 24, borderRadius: '50%',
                                                        background: 'var(--accent)', display: 'flex',
                                                        alignItems: 'center', justifyContent: 'center',
                                                    }}>
                                                    <Check size={14} color="#fff" />
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {/* Step 1: Select Date */}
                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                                Escolha a data
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
                                Próximos 30 dias disponíveis
                            </p>
                            <div style={{
                                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: 8,
                            }}>
                                {dates.map(d => {
                                    const isSelected = selectedDate === d.value;
                                    const isSunday = d.weekday === 'Dom';
                                    return (
                                        <motion.div key={d.value} whileTap={{ scale: 0.95 }}
                                            onClick={() => !isSunday && setSelectedDate(d.value)}
                                            style={{
                                                padding: '12px 8px', borderRadius: 14, textAlign: 'center',
                                                cursor: isSunday ? 'not-allowed' : 'pointer',
                                                opacity: isSunday ? 0.4 : 1,
                                                background: isSelected ? 'linear-gradient(135deg, #2A6F7F, #1E5A68)' : 'var(--bg-card)',
                                                border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                                                transition: 'all 0.2s',
                                            }}>
                                            <div style={{ fontSize: 11, fontWeight: 500, color: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', marginBottom: 2 }}>
                                                {d.weekday}
                                            </div>
                                            <div style={{ fontSize: 20, fontWeight: 700, color: isSelected ? '#fff' : 'var(--text-primary)' }}>
                                                {d.dayNum}
                                            </div>
                                            <div style={{ fontSize: 10, color: isSelected ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)', marginTop: 2 }}>
                                                {d.label.split(' ')[1]}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Select Barber & Time */}
                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                                Barbeiro e horário
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
                                Escolha um profissional e horário disponível
                            </p>
                            {loadingSlots ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />)}
                                </div>
                            ) : barbers.length === 0 ? (
                                <div style={{
                                    padding: 48, textAlign: 'center', borderRadius: 16,
                                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                                }}>
                                    <Calendar size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
                                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Nenhum horário disponível nesta data</p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>Tente outra data</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    {barbers.map(b => {
                                        const isBarberSelected = selectedBarber?.id === b.id;
                                        return (
                                            <div key={b.id} style={{
                                                borderRadius: 16, padding: 16, background: 'var(--bg-card)',
                                                border: `2px solid ${isBarberSelected ? 'var(--accent)' : 'var(--border)'}`,
                                                transition: 'all 0.2s',
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                                    <div style={{
                                                        width: 44, height: 44, borderRadius: '50%',
                                                        background: 'linear-gradient(135deg, #2A6F7F, #1E5A68)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        color: '#fff', fontWeight: 700, fontSize: 16,
                                                    }}>
                                                        {b.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{b.name}</div>
                                                        {b.specialties && (
                                                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.specialties}</div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                    {b.availableSlots.map(slot => {
                                                        const isSlotSelected = isBarberSelected && selectedTime === slot;
                                                        return (
                                                            <motion.button key={slot} whileTap={{ scale: 0.95 }}
                                                                onClick={() => { setSelectedBarber(b); setSelectedTime(slot); }}
                                                                style={{
                                                                    padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500,
                                                                    border: `1.5px solid ${isSlotSelected ? 'var(--accent)' : 'var(--border)'}`,
                                                                    background: isSlotSelected ? 'var(--accent)' : 'var(--bg-secondary)',
                                                                    color: isSlotSelected ? '#fff' : 'var(--text-primary)',
                                                                    cursor: 'pointer', transition: 'all 0.15s',
                                                                }}>
                                                                {slot}
                                                            </motion.button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Step 3: Client Info & Confirm */}
                    {step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                                Seus dados
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
                                Insira seus dados para confirmar o agendamento
                            </p>

                            {/* Summary */}
                            <div style={{
                                background: 'var(--bg-card)', borderRadius: 16, padding: 16,
                                border: '1px solid var(--border)', marginBottom: 20,
                            }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', marginBottom: 12 }}>Resumo do Agendamento</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Serviço</span>
                                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedService?.name}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Data</span>
                                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                            {selectedDate && new Date(selectedDate + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Horário</span>
                                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedTime}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Barbeiro</span>
                                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedBarber?.name}</span>
                                    </div>
                                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 4, display: 'flex', justifyContent: 'space-between', fontSize: 16 }}>
                                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Total</span>
                                        <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{selectedService ? fmt(selectedService.price) : ''}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Form */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                                        Nome completo *
                                    </label>
                                    <input value={clientName} onChange={e => setClientName(e.target.value)}
                                        placeholder="Seu nome"
                                        style={{
                                            width: '100%', padding: '14px 16px', borderRadius: 14, fontSize: 14,
                                            background: 'var(--bg-card)', border: '2px solid var(--border)',
                                            color: 'var(--text-primary)', outline: 'none',
                                        }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                                        Telefone / WhatsApp *
                                    </label>
                                    <input value={clientPhone} onChange={e => setClientPhone(e.target.value)}
                                        placeholder="(11) 99999-9999" type="tel"
                                        style={{
                                            width: '100%', padding: '14px 16px', borderRadius: 14, fontSize: 14,
                                            background: 'var(--bg-card)', border: '2px solid var(--border)',
                                            color: 'var(--text-primary)', outline: 'none',
                                        }} />
                                </div>
                            </div>

                            {error && (
                                <div style={{
                                    marginTop: 16, padding: 12, borderRadius: 12,
                                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
                                    color: '#EF4444', fontSize: 14,
                                }}>
                                    {error}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Navigation */}
                <div style={{
                    display: 'flex', gap: 12, marginTop: 28, paddingBottom: 40,
                }}>
                    {step > 0 && step < 4 && (
                        <motion.button whileTap={{ scale: 0.98 }}
                            onClick={() => setStep(step - 1)}
                            style={{
                                flex: 1, padding: '14px 0', borderRadius: 14, fontSize: 14, fontWeight: 600,
                                background: 'var(--bg-card)', border: '1px solid var(--border)',
                                color: 'var(--text-secondary)', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            }}>
                            <ChevronLeft size={16} /> Voltar
                        </motion.button>
                    )}
                    {step < 3 && (
                        <motion.button whileTap={{ scale: canNext() ? 0.98 : 1 }}
                            onClick={() => canNext() && setStep(step + 1)}
                            disabled={!canNext()}
                            style={{
                                flex: 1, padding: '14px 0', borderRadius: 14, fontSize: 14, fontWeight: 600,
                                background: canNext() ? 'linear-gradient(135deg, #2A6F7F, #1E5A68)' : 'var(--bg-secondary)',
                                color: canNext() ? '#fff' : 'var(--text-muted)',
                                border: 'none', cursor: canNext() ? 'pointer' : 'not-allowed',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                boxShadow: canNext() ? '0 4px 15px rgba(42,111,127,0.25)' : 'none',
                                transition: 'all 0.3s',
                            }}>
                            Continuar <ChevronRight size={16} />
                        </motion.button>
                    )}
                    {step === 3 && (
                        <motion.button whileTap={{ scale: 0.98 }}
                            onClick={handleSubmit} disabled={submitting || !canNext()}
                            style={{
                                flex: 1, padding: '14px 0', borderRadius: 14, fontSize: 14, fontWeight: 600,
                                background: canNext() ? 'linear-gradient(135deg, #22C55E, #16A34A)' : 'var(--bg-secondary)',
                                color: canNext() ? '#fff' : 'var(--text-muted)',
                                border: 'none', cursor: canNext() ? 'pointer' : 'not-allowed',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                boxShadow: canNext() ? '0 4px 15px rgba(34,197,94,0.25)' : 'none',
                                opacity: submitting ? 0.7 : 1,
                            }}>
                            {submitting ? 'Agendando...' : '✓ Confirmar Agendamento'}
                        </motion.button>
                    )}
                </div>
            </div>
        </div>
    );
}

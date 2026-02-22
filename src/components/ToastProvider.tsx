'use client';
import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ addToast: () => { } });

const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
};

const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-amber-500',
    info: 'bg-blue-500',
};

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = Math.random().toString(36).substring(7);
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
                <AnimatePresence>
                    {toasts.map(toast => {
                        const Icon = icons[toast.type];
                        return (
                            <motion.div
                                key={toast.id}
                                initial={{ opacity: 0, x: 100, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 100, scale: 0.95 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                className="pointer-events-auto"
                            >
                                <div
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg"
                                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                                >
                                    <div className={`${colors[toast.type]} p-1.5 rounded-lg`}>
                                        <Icon size={16} className="text-white" />
                                    </div>
                                    <p className="flex-1 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                        {toast.message}
                                    </p>
                                    <button
                                        onClick={() => removeToast(toast.id)}
                                        className="p-1 rounded-lg hover:opacity-70 transition-opacity"
                                        style={{ color: 'var(--text-muted)' }}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => useContext(ToastContext);

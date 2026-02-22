'use client';
import Sidebar from '@/components/layout/Sidebar';
import { motion } from 'framer-motion';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            <Sidebar />
            <main className="flex-1 overflow-x-hidden pt-24 lg:pt-8 p-4 lg:p-6">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
}

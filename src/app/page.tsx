'use client';
import { redirect } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function Home() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      window.location.href = '/dashboard';
    } else if (status === 'unauthenticated') {
      window.location.href = '/login';
    }
  }, [status]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-3 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Carregando...</p>
      </div>
    </div>
  );
}

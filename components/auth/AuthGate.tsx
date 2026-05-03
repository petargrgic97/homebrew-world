'use client';
import { useAuth } from '@/lib/auth/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

export function AuthGate({ children }: { children: ReactNode }) {
  const { loading, isDM } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isDM) router.replace('/dm/login');
  }, [loading, isDM, router]);

  if (loading) return <div className="p-8">Učitavam…</div>;
  if (!isDM) return null;
  return <>{children}</>;
}

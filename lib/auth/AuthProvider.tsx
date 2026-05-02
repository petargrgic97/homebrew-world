'use client';
import { createContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getDmAllowlist, isAllowedDmUid } from './allowlist';

interface AuthState {
  user: User | null;
  loading: boolean;
  isDM: boolean;
}

export const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  isDM: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const isDM = isAllowedDmUid(user?.uid ?? null, getDmAllowlist());
  return (
    <AuthContext.Provider value={{ user, loading, isDM }}>
      {children}
    </AuthContext.Provider>
  );
}

'use client';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/lib/auth/useAuth';
import { Button } from '@/components/ui/button';
import { Ornament } from '@/components/shared/Ornament';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const { user, loading, isDM } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && isDM) router.replace('/dm');
  }, [loading, isDM, router]);

  async function handleSignIn() {
    setError(null);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Prijava nije uspjela');
    }
  }

  if (loading) return <div className="p-10 text-vellum-dim italic">Učitavam…</div>;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="panel panel-bordered rounded-sm p-10 max-w-md w-full text-center space-y-5">
        <div className="display text-[0.7rem] tracking-[0.5em] uppercase text-gold-dim">
          ✦ uđi u utvrdu ✦
        </div>
        <h1 className="display-decorative text-3xl text-gold leading-tight">
          Pečat majstora
        </h1>
        <Ornament className="max-w-40 mx-auto" />
        <p className="text-vellum-dim italic text-sm">
          Samo čuvar kronike može proći ova vrata.
        </p>

        {user && !isDM && (
          <div className="text-left rounded-sm border border-blood/40 bg-blood/10 p-4 text-sm space-y-2">
            <div>
              Prijavljeni ste kao <strong className="text-vellum">{user.email}</strong>, ali ovaj pečat nije poznat vratima.
            </div>
            <div className="text-xs text-vellum-dim">
              Vaš UID: <code className="bg-ink-deep/80 px-1 py-0.5 rounded text-gold-bright">{user.uid}</code>
            </div>
            <Button variant="link" className="px-0 text-gold" onClick={() => signOut(auth)}>
              Odjava
            </Button>
          </div>
        )}

        {!user && (
          <Button onClick={handleSignIn} className="w-full">
            Prijavi se preko Googlea
          </Button>
        )}

        {error && <div className="text-sm text-blood-bright">{error}</div>}
      </div>
    </div>
  );
}

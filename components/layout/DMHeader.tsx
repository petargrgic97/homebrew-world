'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/lib/auth/useAuth';

export function DMHeader() {
  const { user } = useAuth();
  return (
    <div className="relative border-b border-border bg-blood/10">
      <span className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-gold-dim/40 to-transparent" />
      <span className="absolute bottom-0 inset-x-0 h-px bg-linear-to-r from-transparent via-gold-dim/40 to-transparent" />
      <div className="px-6 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="display text-[0.65rem] tracking-[0.45em] uppercase text-gold">
            ✦ Dungeon Master ✦
          </span>
          {user?.email && (
            <span className="hidden sm:inline text-[0.7rem] italic text-vellum-dim/80">
              {user.email}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="display text-[0.6rem] tracking-[0.3em] uppercase text-vellum-dim hover:text-gold transition-colors"
          >
            view as player
          </Link>
          <Button size="sm" variant="ghost" onClick={() => signOut(auth)} className="display text-[0.6rem] tracking-[0.3em] uppercase">
            sign out
          </Button>
        </div>
      </div>
    </div>
  );
}

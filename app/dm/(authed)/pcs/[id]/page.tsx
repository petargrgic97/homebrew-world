'use client';
import { use, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { mutate } from 'swr';
import { usePc } from '@/lib/hooks/usePc';
import { Markdown } from '@/components/shared/Markdown';
import { Ornament } from '@/components/shared/Ornament';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { deletePc } from '@/lib/firestore/pcs';
import { db } from '@/lib/firebase';

const statusStyle: Record<string, string> = {
  alive: 'text-emerald-300/90',
  dead: 'text-vellum-dim/70',
  missing: 'text-amber-300/90',
  unknown: 'text-sky-300/80',
};

export default function DMPcDetail({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: pc } = usePc(id);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const router = useRouter();

  if (!pc) return <div className="p-10 text-vellum-dim italic">Loading…</div>;

  const subtitle = [pc.race, pc.characterClass].filter(Boolean).join(' · ');

  async function handleDelete() {
    await deletePc(db, id);
    await mutate(['pcs']);
    router.push('/dm/pcs');
  }

  return (
    <article className="px-6 md:px-10 py-10 max-w-3xl mx-auto space-y-8">
      <header className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-6 items-start flex-1 min-w-0">
            <div className="shrink-0">
              {pc.portraitUrl ? (
                <Image
                  src={pc.portraitUrl}
                  alt=""
                  width={140}
                  height={140}
                  className="w-32 h-32 sm:w-36 sm:h-36 rounded-full object-cover ring-2 ring-gold-dim/40"
                />
              ) : (
                <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-linear-to-br from-surface-elev to-ink-deep ring-2 ring-gold-dim/30 flex items-center justify-center">
                  <span className="display text-gold-dim/30 text-4xl">✦</span>
                </div>
              )}
            </div>
            <div className="flex-1 space-y-1 min-w-0">
              <div className="display text-[0.65rem] tracking-[0.5em] uppercase text-gold-dim">
                ✦ a hero of the chronicle ✦
              </div>
              <h1 className="display-decorative text-3xl md:text-4xl text-gold leading-tight">
                {pc.name}
              </h1>
              {subtitle && (
                <div className="display text-[0.65rem] tracking-[0.35em] uppercase text-vellum-dim">
                  {subtitle}
                </div>
              )}
              {pc.playerName && (
                <div className="text-sm italic text-vellum-dim/80">
                  played by <span className="text-vellum">{pc.playerName}</span>
                </div>
              )}
              <div className="pt-1">
                <span className={`seal ${statusStyle[pc.status] ?? 'text-vellum-dim'}`}>{pc.status}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button asChild variant="outline">
              <Link href={`/dm/pcs/${id}/edit`}>Edit</Link>
            </Button>
            <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
              Delete
            </Button>
          </div>
        </div>
      </header>
      <Ornament className="max-w-md mx-auto" />
      <Markdown dropcap>{pc.description}</Markdown>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Remove from the party?"
        description="This cannot be undone."
        destructive
        confirmText="Remove"
        onConfirm={handleDelete}
      />
    </article>
  );
}

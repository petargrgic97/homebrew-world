'use client';
import { use, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { mutate } from 'swr';
import { useNpc } from '@/lib/hooks/useNpc';
import { useLocation } from '@/lib/hooks/useLocation';
import { Markdown } from '@/components/shared/Markdown';
import { Ornament } from '@/components/shared/Ornament';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { deleteNpc } from '@/lib/firestore/npcs';
import { db } from '@/lib/firebase';

const statusStyle: Record<string, string> = {
  alive: 'text-emerald-300/90',
  dead: 'text-vellum-dim/70',
  missing: 'text-amber-300/90',
  unknown: 'text-sky-300/80',
};

export default function DMNpcDetail({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: npc } = useNpc(id);
  const { data: location } = useLocation(npc?.locationId ?? '');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const router = useRouter();

  if (!npc) return <div className="p-10 text-vellum-dim italic">Loading…</div>;

  async function handleDelete() {
    await deleteNpc(db, id);
    await mutate(['npcs']);
    if (npc?.locationId) await mutate(['npcs-by-location', npc.locationId]);
    router.push('/dm/npcs');
  }

  return (
    <article className="px-6 md:px-10 py-10 max-w-3xl mx-auto space-y-8">
      <header className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-6 items-start flex-1 min-w-0">
            <div className="shrink-0">
              {npc.portraitUrl ? (
                <Image
                  src={npc.portraitUrl}
                  alt=""
                  width={140}
                  height={140}
                  className="w-32 h-32 sm:w-36 sm:h-36 rounded-sm object-cover ring-1 ring-gold-dim/40"
                />
              ) : (
                <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-sm bg-linear-to-br from-surface-elev to-ink-deep ring-1 ring-gold-dim/30 flex items-center justify-center">
                  <span className="display text-gold-dim/30 text-4xl">✦</span>
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2 min-w-0">
              <div className="display text-[0.65rem] tracking-[0.5em] uppercase text-gold-dim">
                ✦ a soul of note ✦
              </div>
              <h1 className="display-decorative text-3xl md:text-4xl text-gold leading-tight">
                {npc.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`seal ${statusStyle[npc.status] ?? 'text-vellum-dim'}`}>{npc.status}</span>
                {npc.faction && (
                  <span className="display text-[0.65rem] tracking-[0.3em] uppercase text-vellum-dim italic">
                    of the {npc.faction}
                  </span>
                )}
              </div>
              {location && (
                <Link
                  href={`/dm/locations/${location.id}`}
                  className="display text-[0.7rem] tracking-[0.25em] uppercase text-gold hover:text-gold-bright inline-block"
                >
                  ↳ {location.name}
                </Link>
              )}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button asChild variant="outline">
              <Link href={`/dm/npcs/${id}/edit`}>Edit</Link>
            </Button>
            <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
              Delete
            </Button>
          </div>
        </div>
      </header>
      <Ornament className="max-w-md mx-auto" />
      <Markdown dropcap>{npc.description}</Markdown>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete NPC?"
        description="This cannot be undone."
        destructive
        confirmText="Delete"
        onConfirm={handleDelete}
      />
    </article>
  );
}

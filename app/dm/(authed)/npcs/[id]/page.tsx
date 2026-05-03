'use client';
import { use, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { mutate } from 'swr';
import { useNpc } from '@/lib/hooks/useNpc';
import { useLocation } from '@/lib/hooks/useLocation';
import { useEventsByNpc } from '@/lib/hooks/useEvents';
import { Markdown } from '@/components/shared/Markdown';
import { Ornament } from '@/components/shared/Ornament';
import { EventTimeline } from '@/components/events/EventTimeline';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { deleteNpc } from '@/lib/firestore/npcs';
import { db } from '@/lib/firebase';
import { npcStatusLabel } from '@/lib/i18n';

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
  const { data: events } = useEventsByNpc(id);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const router = useRouter();

  if (!npc) return <div className="p-10 text-vellum-dim italic">Učitavam…</div>;

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
                ✦ lik vrijedan spomena ✦
              </div>
              <h1 className="display-decorative text-3xl md:text-4xl text-gold leading-tight">
                {npc.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`seal ${statusStyle[npc.status] ?? 'text-vellum-dim'}`}>{npcStatusLabel[npc.status]}</span>
                {npc.faction && (
                  <span className="display text-[0.65rem] tracking-[0.3em] uppercase text-vellum-dim italic">
                    {npc.faction}
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
              <Link href={`/dm/npcs/${id}/edit`}>Uredi</Link>
            </Button>
            <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
              Obriši
            </Button>
          </div>
        </div>
      </header>
      <Ornament className="max-w-md mx-auto" />
      <Markdown dropcap>{npc.description}</Markdown>

      <section>
        <div className="flex items-center justify-between mb-4 gap-3">
          <h2 className="section-title flex items-center gap-3 flex-1">
            <span>Gdje se pojavljuje</span>
            <span className="h-px flex-1 bg-gold-dim/30" />
          </h2>
          <Button asChild variant="outline" size="sm">
            <Link href={`/dm/events/new?npcId=${id}`}>+ Dodaj događaj</Link>
          </Button>
        </div>
        {events && events.length > 0 ? (
          <EventTimeline events={events} dmEditable />
        ) : (
          <div className="text-sm text-vellum-dim italic">Ovaj lik još nije povezan ni s jednim događajem.</div>
        )}
      </section>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Obrisati lika?"
        description="Ovo se ne može poništiti."
        destructive
        confirmText="Obriši"
        onConfirm={handleDelete}
      />
    </article>
  );
}

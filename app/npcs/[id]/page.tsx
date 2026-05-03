'use client';
import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useNpc } from '@/lib/hooks/useNpc';
import { useLocation } from '@/lib/hooks/useLocation';
import { useEventsByNpc } from '@/lib/hooks/useEvents';
import { Markdown } from '@/components/shared/Markdown';
import { Ornament } from '@/components/shared/Ornament';
import { EventTimeline } from '@/components/events/EventTimeline';
import { npcStatusLabel } from '@/lib/i18n';

const statusStyle: Record<string, string> = {
  alive: 'text-emerald-300/90',
  dead: 'text-vellum-dim/70',
  missing: 'text-amber-300/90',
  unknown: 'text-sky-300/80',
};

export default function NpcDetail({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: npc, isLoading } = useNpc(id);
  const { data: location } = useLocation(npc?.locationId ?? '');
  const { data: events } = useEventsByNpc(id);

  if (isLoading) return <div className="p-10 text-vellum-dim italic">Učitavam…</div>;
  if (!npc) return <div className="p-10 text-vellum-dim italic">Lik nije pronađen.</div>;

  return (
    <article className="px-6 md:px-10 py-10 max-w-3xl mx-auto space-y-8">
      <header className="flex flex-col sm:flex-row gap-6 items-start">
        <div className="shrink-0 mx-auto sm:mx-0">
          {npc.portraitUrl ? (
            <Image
              src={npc.portraitUrl}
              alt=""
              width={160}
              height={160}
              className="w-40 h-40 rounded-sm object-cover ring-1 ring-gold-dim/40 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)]"
            />
          ) : (
            <div className="w-40 h-40 rounded-sm bg-linear-to-br from-surface-elev to-ink-deep ring-1 ring-gold-dim/30 flex items-center justify-center">
              <span className="display text-gold-dim/30 text-5xl">✦</span>
            </div>
          )}
        </div>
        <div className="flex-1 space-y-3">
          <div className="display text-[0.65rem] tracking-[0.5em] uppercase text-gold-dim">
            ✦ lik vrijedan spomena ✦
          </div>
          <h1 className="display-decorative text-4xl md:text-5xl text-gold leading-tight">
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
              href={`/locations/${location.id}`}
              className="display text-[0.7rem] tracking-[0.25em] uppercase text-gold hover:text-gold-bright inline-block"
            >
              ↳ {location.name}
            </Link>
          )}
        </div>
      </header>
      <Ornament className="max-w-md mx-auto" />
      <Markdown dropcap>{npc.description}</Markdown>

      {events && events.length > 0 && (
        <section>
          <h2 className="section-title mb-4 flex items-center gap-3">
            <span>Gdje se pojavljuje</span>
            <span className="h-px flex-1 bg-gold-dim/30" />
          </h2>
          <EventTimeline events={events} />
        </section>
      )}
    </article>
  );
}

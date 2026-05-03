'use client';
import { use } from 'react';
import Image from 'next/image';
import { usePc } from '@/lib/hooks/usePc';
import { useEventsByPc } from '@/lib/hooks/useEvents';
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

export default function PcDetail({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: pc, isLoading } = usePc(id);
  const { data: events } = useEventsByPc(id);

  if (isLoading) return <div className="p-10 text-vellum-dim italic">Učitavam…</div>;
  if (!pc) return <div className="p-10 text-vellum-dim italic">Heroj nije pronađen.</div>;

  const subtitle = [pc.race, pc.characterClass].filter(Boolean).join(' · ');

  return (
    <article className="px-6 md:px-10 py-10 max-w-3xl mx-auto space-y-8">
      <header className="flex flex-col items-center text-center space-y-4">
        <div>
          {pc.portraitUrl ? (
            <Image
              src={pc.portraitUrl}
              alt=""
              width={200}
              height={200}
              className="w-44 h-44 rounded-full object-cover ring-2 ring-gold-dim/50 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.7)]"
            />
          ) : (
            <div className="w-44 h-44 rounded-full bg-linear-to-br from-surface-elev to-ink-deep ring-2 ring-gold-dim/30 flex items-center justify-center">
              <span className="display text-gold-dim/30 text-6xl">✦</span>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <div className="display text-[0.65rem] tracking-[0.5em] uppercase text-gold-dim">
            ✦ heroj iz kronike ✦
          </div>
          <h1 className="display-decorative text-4xl md:text-5xl text-gold leading-tight">
            {pc.name}
          </h1>
          {subtitle && (
            <div className="display text-[0.7rem] tracking-[0.35em] uppercase text-vellum-dim">
              {subtitle}
            </div>
          )}
          {pc.playerName && (
            <div className="text-sm italic text-vellum-dim/80 mt-1">
              igra <span className="text-vellum">{pc.playerName}</span>
            </div>
          )}
          <div className="pt-2">
            <span className={`seal ${statusStyle[pc.status] ?? 'text-vellum-dim'}`}>{npcStatusLabel[pc.status]}</span>
          </div>
        </div>
        <Ornament className="max-w-xs" />
      </header>

      <Markdown dropcap>{pc.description}</Markdown>

      {events && events.length > 0 && (
        <section>
          <h2 className="section-title mb-4 flex items-center gap-3">
            <span>Njegova djela</span>
            <span className="h-px flex-1 bg-gold-dim/30" />
          </h2>
          <EventTimeline events={events} />
        </section>
      )}
    </article>
  );
}

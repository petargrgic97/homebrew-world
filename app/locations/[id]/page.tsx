'use client';
import { use } from 'react';
import Image from 'next/image';
import { useLocation } from '@/lib/hooks/useLocation';
import { useNpcsByLocation } from '@/lib/hooks/useNpcsByLocation';
import { useEventsByLocation } from '@/lib/hooks/useEvents';
import { Markdown } from '@/components/shared/Markdown';
import { NpcCard } from '@/components/npcs/NpcCard';
import { EventTimeline } from '@/components/events/EventTimeline';
import { Ornament } from '@/components/shared/Ornament';

export default function LocationDetail({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: location, isLoading } = useLocation(id);
  const { data: npcs } = useNpcsByLocation(id);
  const { data: events } = useEventsByLocation(id);

  if (isLoading) return <div className="p-10 text-vellum-dim italic">Učitavam…</div>;
  if (!location) return <div className="p-10 text-vellum-dim italic">Lokacija nije pronađena.</div>;

  return (
    <article className="px-6 md:px-10 py-10 max-w-3xl mx-auto space-y-8">
      <header className="text-center space-y-3">
        <div className="display text-[0.65rem] tracking-[0.5em] uppercase text-gold-dim">
          ✦ mjesto na karti ✦
        </div>
        <h1 className="display-decorative text-4xl md:text-5xl text-gold leading-tight">
          {location.name}
        </h1>
        <Ornament className="max-w-xs mx-auto" />
      </header>

      {location.imageUrl && (
        <figure className="panel rounded-sm p-2">
          <Image
            src={location.imageUrl}
            alt=""
            width={1000}
            height={500}
            className="w-full h-72 object-cover rounded-sm ring-1 ring-gold-dim/20"
          />
        </figure>
      )}

      <Markdown dropcap>{location.description}</Markdown>

      {npcs && npcs.length > 0 && (
        <section>
          <h2 className="section-title mb-4 flex items-center gap-3">
            <span>Likovi ovdje</span>
            <span className="h-px flex-1 bg-gold-dim/30" />
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {npcs.map(n => <NpcCard key={n.id} npc={n} />)}
          </div>
        </section>
      )}

      {events && events.length > 0 && (
        <section>
          <h2 className="section-title mb-4 flex items-center gap-3">
            <span>Što se zbilo</span>
            <span className="h-px flex-1 bg-gold-dim/30" />
          </h2>
          <EventTimeline events={events} />
        </section>
      )}
    </article>
  );
}

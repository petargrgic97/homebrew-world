'use client';
import { use } from 'react';
import { useSession } from '@/lib/hooks/useSession';
import { useEventsBySession } from '@/lib/hooks/useEvents';
import { Markdown } from '@/components/shared/Markdown';
import { EventTimeline } from '@/components/events/EventTimeline';
import { Ornament } from '@/components/shared/Ornament';

export default function SessionDetail({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session, isLoading } = useSession(id);
  const { data: events } = useEventsBySession(id);

  if (isLoading) return <div className="p-10 text-vellum-dim italic">Loading…</div>;
  if (!session) return <div className="p-10 text-vellum-dim italic">Session not found.</div>;

  return (
    <article className="px-6 md:px-10 py-10 max-w-3xl mx-auto space-y-8">
      <header className="text-center space-y-2">
        <div className="display text-[0.65rem] tracking-[0.5em] uppercase text-gold-dim">
          ✦ session {session.number}{session.date ? ` · ${session.date}` : ''} ✦
        </div>
        <h1 className="display-decorative text-4xl md:text-5xl text-gold leading-tight">
          {session.title || `Session ${session.number}`}
        </h1>
        <Ornament className="max-w-xs mx-auto" />
      </header>

      <Markdown dropcap>{session.recap}</Markdown>

      {events && events.length > 0 && (
        <section>
          <h2 className="section-title mb-4 flex items-center gap-3">
            <span>Events of Note</span>
            <span className="h-px flex-1 bg-gold-dim/30" />
          </h2>
          <EventTimeline events={events} />
        </section>
      )}
    </article>
  );
}

'use client';
import { useMemo } from 'react';
import { useSessions } from '@/lib/hooks/useSessions';
import { useEvents } from '@/lib/hooks/useEvents';
import { SessionCard } from '@/components/sessions/SessionCard';
import { PageHeader } from '@/components/shared/PageHeader';

export default function SessionsPage() {
  const { data: sessions, isLoading } = useSessions();
  const { data: events = [] } = useEvents();

  const eventsBySession = useMemo(() => {
    const map = new Map<string, typeof events>();
    for (const ev of events) {
      if (!ev.sessionId) continue;
      const list = map.get(ev.sessionId) ?? [];
      list.push(ev);
      map.set(ev.sessionId, list);
    }
    return map;
  }, [events]);

  return (
    <div className="px-6 md:px-10 py-10 max-w-5xl mx-auto">
      <PageHeader eyebrow="Entries in the chronicle" title="Sessions" />
      {isLoading ? (
        <div className="text-vellum-dim italic">Turning the pages…</div>
      ) : !sessions || sessions.length === 0 ? (
        <div className="text-vellum-dim italic py-12 text-center panel rounded-sm">
          The chronicle is yet to be opened.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {sessions.map(s => (
            <SessionCard
              key={s.id}
              session={s}
              events={eventsBySession.get(s.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

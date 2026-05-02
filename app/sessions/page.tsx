'use client';
import { useSessions } from '@/lib/hooks/useSessions';
import { SessionCard } from '@/components/sessions/SessionCard';
import { PageHeader } from '@/components/shared/PageHeader';

export default function SessionsPage() {
  const { data, isLoading } = useSessions();
  return (
    <div className="px-6 md:px-10 py-10 max-w-5xl mx-auto">
      <PageHeader eyebrow="Entries in the chronicle" title="Sessions" />
      {isLoading ? (
        <div className="text-vellum-dim italic">Turning the pages…</div>
      ) : !data || data.length === 0 ? (
        <div className="text-vellum-dim italic py-12 text-center panel rounded-sm">
          The chronicle is yet to be opened.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.map(s => <SessionCard key={s.id} session={s} />)}
        </div>
      )}
    </div>
  );
}

'use client';
import Link from 'next/link';
import { useSessions } from '@/lib/hooks/useSessions';
import { SessionCard } from '@/components/sessions/SessionCard';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';

export default function DMSessionsPage() {
  const { data, isLoading } = useSessions();
  return (
    <div className="px-6 md:px-10 py-10 max-w-5xl mx-auto">
      <PageHeader
        eyebrow="Entries in the chronicle"
        title="Sessions"
        actions={
          <Button asChild>
            <Link href="/dm/sessions/new">+ Begin Session</Link>
          </Button>
        }
      />
      {isLoading ? (
        <div className="text-vellum-dim italic">Loading…</div>
      ) : !data || data.length === 0 ? (
        <div className="text-vellum-dim italic py-12 text-center panel rounded-sm">
          The chronicle is yet to be opened.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.map(s => <SessionCard key={s.id} session={s} basePath="/dm/sessions" />)}
        </div>
      )}
    </div>
  );
}

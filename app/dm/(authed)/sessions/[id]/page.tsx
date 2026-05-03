'use client';
import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { mutate } from 'swr';
import { useSession } from '@/lib/hooks/useSession';
import { useEventsBySession } from '@/lib/hooks/useEvents';
import { Markdown } from '@/components/shared/Markdown';
import { EventTimeline } from '@/components/events/EventTimeline';
import { Ornament } from '@/components/shared/Ornament';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { deleteSession } from '@/lib/firestore/sessions';
import { db } from '@/lib/firebase';

export default function DMSessionDetail({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession(id);
  const { data: events } = useEventsBySession(id);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const router = useRouter();

  if (!session) return <div className="p-10 text-vellum-dim italic">Loading…</div>;

  async function handleDelete() {
    await deleteSession(db, id);
    await mutate(['sessions']);
    router.push('/dm/sessions');
  }

  return (
    <article className="px-6 md:px-10 py-10 max-w-3xl mx-auto space-y-8">
      <header className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="display text-[0.65rem] tracking-[0.5em] uppercase text-gold-dim">
              ✦ session {session.number}{session.date ? ` · ${session.date}` : ''} ✦
            </div>
            <h1 className="display-decorative text-3xl md:text-4xl text-gold leading-tight mt-1">
              {session.title || `Session ${session.number}`}
            </h1>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button asChild variant="outline">
              <Link href={`/dm/sessions/${id}/edit`}>Edit</Link>
            </Button>
            <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
              Delete
            </Button>
          </div>
        </div>
        <Ornament className="max-w-xs" />
      </header>

      <Markdown dropcap>{session.recap}</Markdown>

      <section>
        <div className="flex items-center justify-between mb-4 gap-3">
          <h2 className="section-title flex items-center gap-3 flex-1">
            <span>Events of Note</span>
            <span className="h-px flex-1 bg-gold-dim/30" />
          </h2>
          <Button asChild variant="outline" size="sm">
            <Link href={`/dm/events/new?sessionId=${id}`}>+ Add event</Link>
          </Button>
        </div>
        {events && events.length > 0 ? (
          <EventTimeline events={events} dmEditable />
        ) : (
          <div className="text-sm text-vellum-dim italic">No events tagged to this session.</div>
        )}
      </section>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete session?"
        description="This cannot be undone. Events tagged to this session will be unlinked but not deleted."
        destructive
        confirmText="Delete"
        onConfirm={handleDelete}
      />
    </article>
  );
}

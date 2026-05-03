'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { mutate } from 'swr';
import { useEvent } from '@/lib/hooks/useEvent';
import { EventForm } from '@/components/events/EventForm';
import { updateEvent, deleteEvent } from '@/lib/firestore/events';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PageHeader } from '@/components/shared/PageHeader';

export default function EditEvent({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: event } = useEvent(id);
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!event) return <div className="p-10 text-vellum-dim italic">Učitavam…</div>;

  async function handleDelete() {
    await deleteEvent(db, id);
    await mutate(['events']);
    if (event?.locationId) await mutate(['events-by-location', event.locationId]);
    if (event?.sessionId) await mutate(['events-by-session', event.sessionId]);
    for (const nid of event?.npcIds ?? []) await mutate(['events-by-npc', nid]);
    for (const pid of event?.pcIds ?? []) await mutate(['events-by-pc', pid]);
    router.back();
  }

  return (
    <div className="px-6 md:px-10 py-10 max-w-3xl mx-auto">
      <PageHeader
        eyebrow="Izmijeni zapis"
        title="Uredi događaj"
        actions={
          <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
            Obriši
          </Button>
        }
      />
      <EventForm
        initial={event}
        onSubmit={async (input) => {
          const prevLocationId = event.locationId;
          const prevSessionId = event.sessionId;
          const prevNpcIds = event.npcIds ?? [];
          const prevPcIds = event.pcIds ?? [];
          await updateEvent(db, id, input);
          await mutate(['event', id]);
          await mutate(['events']);
          for (const lid of [prevLocationId, input.locationId]) {
            if (lid) await mutate(['events-by-location', lid]);
          }
          for (const sid of [prevSessionId, input.sessionId]) {
            if (sid) await mutate(['events-by-session', sid]);
          }
          const allNpcIds = new Set([...prevNpcIds, ...input.npcIds]);
          for (const nid of allNpcIds) await mutate(['events-by-npc', nid]);
          const allPcIds = new Set([...prevPcIds, ...input.pcIds]);
          for (const pid of allPcIds) await mutate(['events-by-pc', pid]);
          router.back();
        }}
        onCancel={() => router.back()}
      />
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Obrisati događaj?"
        description="Ovo se ne može poništiti."
        destructive
        confirmText="Obriši"
        onConfirm={handleDelete}
      />
    </div>
  );
}

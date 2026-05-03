'use client';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { mutate } from 'swr';
import { EventForm } from '@/components/events/EventForm';
import { createEvent } from '@/lib/firestore/events';
import { db } from '@/lib/firebase';
import { PageHeader } from '@/components/shared/PageHeader';

function NewEventInner() {
  const router = useRouter();
  const params = useSearchParams();
  const locationId = params.get('locationId');
  const sessionId = params.get('sessionId');
  const npcId = params.get('npcId');
  const pcId = params.get('pcId');

  return (
    <div className="px-6 md:px-10 py-10 max-w-3xl mx-auto">
      <PageHeader eyebrow="Zabilježi što se zbilo" title="Novi događaj" />
      <EventForm
        initial={{
          locationId,
          sessionId,
          npcIds: npcId ? [npcId] : [],
          pcIds: pcId ? [pcId] : [],
        }}
        onSubmit={async (input) => {
          await createEvent(db, input);
          await mutate(['events']);
          if (input.locationId) await mutate(['events-by-location', input.locationId]);
          if (input.sessionId) await mutate(['events-by-session', input.sessionId]);
          for (const id of input.npcIds) await mutate(['events-by-npc', id]);
          for (const id of input.pcIds) await mutate(['events-by-pc', id]);
          router.back();
        }}
        onCancel={() => router.back()}
      />
    </div>
  );
}

export default function NewEvent() {
  return (
    <Suspense fallback={<div className="p-10 text-vellum-dim italic">Učitavam…</div>}>
      <NewEventInner />
    </Suspense>
  );
}

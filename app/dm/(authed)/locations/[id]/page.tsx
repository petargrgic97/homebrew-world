'use client';
import { use, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { mutate } from 'swr';
import { useLocation } from '@/lib/hooks/useLocation';
import { useNpcsByLocation } from '@/lib/hooks/useNpcsByLocation';
import { useEventsByLocation } from '@/lib/hooks/useEvents';
import { Markdown } from '@/components/shared/Markdown';
import { NpcCard } from '@/components/npcs/NpcCard';
import { EventTimeline } from '@/components/events/EventTimeline';
import { Ornament } from '@/components/shared/Ornament';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { deleteLocation } from '@/lib/firestore/locations';
import { db } from '@/lib/firebase';

export default function DMLocationDetail({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: location } = useLocation(id);
  const { data: npcs } = useNpcsByLocation(id);
  const { data: events } = useEventsByLocation(id);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const router = useRouter();

  if (!location) return <div className="p-10 text-vellum-dim italic">Loading…</div>;

  async function handleDelete() {
    await deleteLocation(db, id);
    await mutate(['locations']);
    router.push('/dm/locations');
  }

  return (
    <article className="px-6 md:px-10 py-10 max-w-3xl mx-auto space-y-8">
      <header className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="display text-[0.65rem] tracking-[0.5em] uppercase text-gold-dim">
              ✦ a place upon the map ✦
            </div>
            <h1 className="display-decorative text-4xl md:text-5xl text-gold leading-tight mt-1">
              {location.name}
            </h1>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button asChild variant="outline">
              <Link href={`/dm/locations/${id}/edit`}>Edit</Link>
            </Button>
            <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
              Delete
            </Button>
          </div>
        </div>
        <Ornament className="max-w-xs" />
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

      <section>
        <div className="flex items-center justify-between mb-4 gap-3">
          <h2 className="section-title flex items-center gap-3 flex-1">
            <span>Souls Encountered Here</span>
            <span className="h-px flex-1 bg-gold-dim/30" />
          </h2>
        </div>
        {npcs && npcs.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {npcs.map(n => <NpcCard key={n.id} npc={n} basePath="/dm/npcs" />)}
          </div>
        ) : (
          <div className="text-sm text-vellum-dim italic">No souls linked here yet.</div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4 gap-3">
          <h2 className="section-title flex items-center gap-3 flex-1">
            <span>What Came to Pass</span>
            <span className="h-px flex-1 bg-gold-dim/30" />
          </h2>
          <Button asChild variant="outline" size="sm">
            <Link href={`/dm/events/new?locationId=${id}`}>+ Add event</Link>
          </Button>
        </div>
        {events && events.length > 0 ? (
          <EventTimeline events={events} dmEditable />
        ) : (
          <div className="text-sm text-vellum-dim italic">No events recorded yet.</div>
        )}
      </section>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete location?"
        description="This cannot be undone. NPCs and events tied here will be unlinked but not deleted."
        destructive
        confirmText="Delete"
        onConfirm={handleDelete}
      />
    </article>
  );
}

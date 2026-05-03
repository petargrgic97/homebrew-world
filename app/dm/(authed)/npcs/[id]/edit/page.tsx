'use client';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { mutate } from 'swr';
import { useNpc } from '@/lib/hooks/useNpc';
import { NpcForm } from '@/components/npcs/NpcForm';
import { updateNpc } from '@/lib/firestore/npcs';
import { db } from '@/lib/firebase';
import { PageHeader } from '@/components/shared/PageHeader';

export default function EditNpc({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: npc } = useNpc(id);
  const router = useRouter();

  if (!npc) return <div className="p-10 text-vellum-dim italic">Učitavam…</div>;

  return (
    <div className="px-6 md:px-10 py-10 max-w-3xl mx-auto">
      <PageHeader eyebrow="Izmijeni zapis" title="Uredi lika" />
      <NpcForm
        initial={npc}
        onSubmit={async (input) => {
          const prevLocationId = npc.locationId;
          await updateNpc(db, id, input);
          await mutate(['npc', id]);
          await mutate(['npcs']);
          if (prevLocationId) await mutate(['npcs-by-location', prevLocationId]);
          if (input.locationId && input.locationId !== prevLocationId) {
            await mutate(['npcs-by-location', input.locationId]);
          }
          router.push(`/dm/npcs/${id}`);
        }}
        onCancel={() => router.push(`/dm/npcs/${id}`)}
      />
    </div>
  );
}

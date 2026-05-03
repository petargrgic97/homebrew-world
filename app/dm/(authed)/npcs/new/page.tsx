'use client';
import { useRouter } from 'next/navigation';
import { mutate } from 'swr';
import { NpcForm } from '@/components/npcs/NpcForm';
import { createNpc } from '@/lib/firestore/npcs';
import { db } from '@/lib/firebase';
import { PageHeader } from '@/components/shared/PageHeader';

export default function NewNpc() {
  const router = useRouter();
  return (
    <div className="px-6 md:px-10 py-10 max-w-3xl mx-auto">
      <PageHeader eyebrow="Upiši lika" title="Novi lik" />
      <NpcForm
        onSubmit={async (input) => {
          const id = await createNpc(db, input);
          await mutate(['npcs']);
          if (input.locationId) await mutate(['npcs-by-location', input.locationId]);
          router.push(`/dm/npcs/${id}`);
        }}
        onCancel={() => router.push('/dm/npcs')}
      />
    </div>
  );
}

'use client';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { mutate } from 'swr';
import { usePc } from '@/lib/hooks/usePc';
import { PcForm } from '@/components/pcs/PcForm';
import { updatePc } from '@/lib/firestore/pcs';
import { db } from '@/lib/firebase';
import { PageHeader } from '@/components/shared/PageHeader';

export default function EditPc({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: pc } = usePc(id);
  const router = useRouter();

  if (!pc) return <div className="p-10 text-vellum-dim italic">Učitavam…</div>;

  return (
    <div className="px-6 md:px-10 py-10 max-w-3xl mx-auto">
      <PageHeader eyebrow="Izmijeni zapis" title="Uredi heroja" />
      <PcForm
        initial={pc}
        onSubmit={async (input) => {
          await updatePc(db, id, input);
          await mutate(['pc', id]);
          await mutate(['pcs']);
          router.push(`/dm/pcs/${id}`);
        }}
        onCancel={() => router.push(`/dm/pcs/${id}`)}
      />
    </div>
  );
}

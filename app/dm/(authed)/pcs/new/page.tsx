'use client';
import { useRouter } from 'next/navigation';
import { mutate } from 'swr';
import { PcForm } from '@/components/pcs/PcForm';
import { createPc } from '@/lib/firestore/pcs';
import { db } from '@/lib/firebase';
import { PageHeader } from '@/components/shared/PageHeader';

export default function NewPc() {
  const router = useRouter();
  return (
    <div className="px-6 md:px-10 py-10 max-w-3xl mx-auto">
      <PageHeader eyebrow="Pozdravi heroja" title="Novi heroj" />
      <PcForm
        onSubmit={async (input) => {
          const id = await createPc(db, input);
          await mutate(['pcs']);
          router.push(`/dm/pcs/${id}`);
        }}
        onCancel={() => router.push('/dm/pcs')}
      />
    </div>
  );
}

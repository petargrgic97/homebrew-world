'use client';
import { useRouter } from 'next/navigation';
import { mutate } from 'swr';
import { PlotForm } from '@/components/plots/PlotForm';
import { createPlot } from '@/lib/firestore/plots';
import { db } from '@/lib/firebase';
import { PageHeader } from '@/components/shared/PageHeader';

export default function NewPlot() {
  const router = useRouter();
  return (
    <div className="px-6 md:px-10 py-10 max-w-3xl mx-auto">
      <PageHeader eyebrow="Snuj urotu" title="Nova spletka" />
      <PlotForm
        onSubmit={async (input) => {
          const id = await createPlot(db, input);
          await mutate(['plots']);
          router.push(`/dm/plots/${id}`);
        }}
        onCancel={() => router.push('/dm/plots')}
      />
    </div>
  );
}

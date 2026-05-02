'use client';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { mutate } from 'swr';
import { usePlot } from '@/lib/hooks/usePlot';
import { PlotForm } from '@/components/plots/PlotForm';
import { updatePlot } from '@/lib/firestore/plots';
import { db } from '@/lib/firebase';
import { PageHeader } from '@/components/shared/PageHeader';

export default function EditPlot({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: plot } = usePlot(id);
  const router = useRouter();

  if (!plot) return <div className="p-10 text-vellum-dim italic">Loading…</div>;

  return (
    <div className="px-6 md:px-10 py-10 max-w-3xl mx-auto">
      <PageHeader eyebrow="Amend the scheme" title="Edit Plot" />
      <PlotForm
        initial={plot}
        onSubmit={async (input) => {
          await updatePlot(db, id, input);
          await mutate(['plot', id]);
          await mutate(['plots']);
          router.push(`/dm/plots/${id}`);
        }}
        onCancel={() => router.push(`/dm/plots/${id}`)}
      />
    </div>
  );
}

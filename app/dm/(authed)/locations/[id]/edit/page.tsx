'use client';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { mutate } from 'swr';
import { useLocation } from '@/lib/hooks/useLocation';
import { LocationForm } from '@/components/locations/LocationForm';
import { updateLocation } from '@/lib/firestore/locations';
import { db } from '@/lib/firebase';
import { PageHeader } from '@/components/shared/PageHeader';

export default function EditLocation({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: location } = useLocation(id);
  const router = useRouter();

  if (!location) return <div className="p-10 text-vellum-dim italic">Učitavam…</div>;

  return (
    <div className="px-6 md:px-10 py-10 max-w-3xl mx-auto">
      <PageHeader eyebrow="Izmijeni zapis" title="Uredi lokaciju" />
      <LocationForm
        initial={location}
        onSubmit={async (input) => {
          await updateLocation(db, id, input);
          await mutate(['location', id]);
          await mutate(['locations']);
          router.push(`/dm/locations/${id}`);
        }}
        onCancel={() => router.push(`/dm/locations/${id}`)}
      />
    </div>
  );
}

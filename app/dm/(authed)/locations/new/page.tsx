'use client';
import { useRouter } from 'next/navigation';
import { mutate } from 'swr';
import { LocationForm } from '@/components/locations/LocationForm';
import { createLocation } from '@/lib/firestore/locations';
import { db } from '@/lib/firebase';
import { PageHeader } from '@/components/shared/PageHeader';

export default function NewLocation() {
  const router = useRouter();
  return (
    <div className="px-6 md:px-10 py-10 max-w-3xl mx-auto">
      <PageHeader eyebrow="Upiši mjesto" title="Nova lokacija" />
      <LocationForm
        onSubmit={async (input) => {
          const id = await createLocation(db, input);
          await mutate(['locations']);
          router.push(`/dm/locations/${id}`);
        }}
        onCancel={() => router.push('/dm/locations')}
      />
    </div>
  );
}

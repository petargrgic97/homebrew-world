'use client';
import { useRouter } from 'next/navigation';
import { mutate } from 'swr';
import { SessionForm } from '@/components/sessions/SessionForm';
import { createSession } from '@/lib/firestore/sessions';
import { db } from '@/lib/firebase';
import { PageHeader } from '@/components/shared/PageHeader';

export default function NewSession() {
  const router = useRouter();
  return (
    <div className="px-6 md:px-10 py-10 max-w-3xl mx-auto">
      <PageHeader eyebrow="Open a new chapter" title="New Session" />
      <SessionForm
        onSubmit={async (input) => {
          const id = await createSession(db, input);
          await mutate(['sessions']);
          router.push(`/dm/sessions/${id}`);
        }}
        onCancel={() => router.push('/dm/sessions')}
      />
    </div>
  );
}

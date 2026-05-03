'use client';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { mutate } from 'swr';
import { useSession } from '@/lib/hooks/useSession';
import { SessionForm } from '@/components/sessions/SessionForm';
import { updateSession } from '@/lib/firestore/sessions';
import { db } from '@/lib/firebase';
import { PageHeader } from '@/components/shared/PageHeader';

export default function EditSession({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession(id);
  const router = useRouter();

  if (!session) return <div className="p-10 text-vellum-dim italic">Učitavam…</div>;

  return (
    <div className="px-6 md:px-10 py-10 max-w-3xl mx-auto">
      <PageHeader eyebrow="Izmijeni kroniku" title="Uredi sesiju" />
      <SessionForm
        initial={session}
        onSubmit={async (input) => {
          await updateSession(db, id, input);
          await mutate(['session', id]);
          await mutate(['sessions']);
          router.push(`/dm/sessions/${id}`);
        }}
        onCancel={() => router.push(`/dm/sessions/${id}`)}
      />
    </div>
  );
}

'use client';
import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { mutate } from 'swr';
import { usePlot } from '@/lib/hooks/usePlot';
import { useNpcs } from '@/lib/hooks/useNpcs';
import { usePcs } from '@/lib/hooks/usePcs';
import { useLocations } from '@/lib/hooks/useLocations';
import { Markdown } from '@/components/shared/Markdown';
import { Ornament } from '@/components/shared/Ornament';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { deletePlot } from '@/lib/firestore/plots';
import { db } from '@/lib/firebase';

const statusStyle: Record<string, string> = {
  active: 'text-emerald-300/90',
  resolved: 'text-vellum-dim/70',
  dormant: 'text-amber-300/90',
};

export default function DMPlotDetail({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: plot } = usePlot(id);
  const { data: npcs = [] } = useNpcs();
  const { data: pcs = [] } = usePcs();
  const { data: locations = [] } = useLocations();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const router = useRouter();

  if (!plot) return <div className="p-10 text-vellum-dim italic">Loading…</div>;

  const linkedNpcs = npcs.filter(n => (plot.npcIds ?? []).includes(n.id));
  const linkedPcs = pcs.filter(p => (plot.pcIds ?? []).includes(p.id));
  const linkedLocations = locations.filter(l => (plot.locationIds ?? []).includes(l.id));

  async function handleDelete() {
    await deletePlot(db, id);
    await mutate(['plots']);
    router.push('/dm/plots');
  }

  return (
    <article className="px-6 md:px-10 py-10 max-w-3xl mx-auto space-y-8">
      <header className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="display text-[0.65rem] tracking-[0.5em] uppercase text-gold-dim">
              ✦ a scheme in motion ✦
            </div>
            <h1 className="display-decorative text-3xl md:text-4xl text-gold leading-tight mt-1">
              {plot.title}
            </h1>
            <span className={`seal mt-2 ${statusStyle[plot.status] ?? 'text-vellum-dim'}`}>{plot.status}</span>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button asChild variant="outline">
              <Link href={`/dm/plots/${id}/edit`}>Edit</Link>
            </Button>
            <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
              Delete
            </Button>
          </div>
        </div>
        <Ornament className="max-w-xs" />
      </header>

      <Markdown dropcap>{plot.description}</Markdown>

      {linkedPcs.length > 0 && (
        <section>
          <h2 className="section-title mb-3 flex items-center gap-3">
            <span>Heroes at Stake</span>
            <span className="h-px flex-1 bg-gold-dim/30" />
          </h2>
          <ul className="space-y-1">
            {linkedPcs.map(p => (
              <li key={p.id}>
                <Link
                  href={`/dm/pcs/${p.id}`}
                  className="text-gold hover:text-gold-bright underline decoration-gold-dim/50 underline-offset-2"
                >
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {linkedNpcs.length > 0 && (
        <section>
          <h2 className="section-title mb-3 flex items-center gap-3">
            <span>Souls Entangled</span>
            <span className="h-px flex-1 bg-gold-dim/30" />
          </h2>
          <ul className="space-y-1">
            {linkedNpcs.map(n => (
              <li key={n.id}>
                <Link
                  href={`/dm/npcs/${n.id}`}
                  className="text-gold hover:text-gold-bright underline decoration-gold-dim/50 underline-offset-2"
                >
                  {n.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {linkedLocations.length > 0 && (
        <section>
          <h2 className="section-title mb-3 flex items-center gap-3">
            <span>Places at Stake</span>
            <span className="h-px flex-1 bg-gold-dim/30" />
          </h2>
          <ul className="space-y-1">
            {linkedLocations.map(l => (
              <li key={l.id}>
                <Link
                  href={`/dm/locations/${l.id}`}
                  className="text-gold hover:text-gold-bright underline decoration-gold-dim/50 underline-offset-2"
                >
                  {l.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete plot?"
        description="This cannot be undone."
        destructive
        confirmText="Delete"
        onConfirm={handleDelete}
      />
    </article>
  );
}

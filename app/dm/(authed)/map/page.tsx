'use client';
import Image from 'next/image';
import { useState } from 'react';
import { mutate } from 'swr';
import { useCurrentMap } from '@/lib/hooks/useCurrentMap';
import { useMapVersions } from '@/lib/hooks/useMapVersions';
import { MapDisplay } from '@/components/map/MapDisplay';
import { MapUpload } from '@/components/map/MapUpload';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { deleteMapVersion } from '@/lib/firestore/maps';
import { db } from '@/lib/firebase';

export default function DMMapPage() {
  const { data: current } = useCurrentMap();
  const { data: versions = [] } = useMapVersions();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const past = versions.filter(v => !v.isCurrent);

  async function handleDelete(id: string) {
    await deleteMapVersion(db, id);
    await mutate(['current-map']);
    await mutate(['map-versions']);
  }

  return (
    <div className="px-6 md:px-10 py-10 max-w-5xl mx-auto space-y-10">
      <PageHeader eyebrow="Poznate zemlje" title="Karta" />

      <MapUpload />

      {current ? (
        <section>
          <h2 className="section-title mb-4 flex items-center gap-3">
            <span>Trenutna skica</span>
            <span className="h-px flex-1 bg-gold-dim/30" />
          </h2>
          <MapDisplay map={current} />
        </section>
      ) : (
        <div className="text-vellum-dim italic py-12 text-center panel rounded-sm">
          Karta još nije iscrtana.
        </div>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="section-title mb-4 flex items-center gap-3">
            <span>Ranije skice ({past.length})</span>
            <span className="h-px flex-1 bg-gold-dim/30" />
          </h2>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
            {past.map(v => (
              <figure key={v.id} className="panel rounded-sm p-2 space-y-2">
                <Image
                  src={v.imageUrl}
                  alt={v.caption ?? ''}
                  width={300}
                  height={200}
                  className="w-full h-auto rounded-sm"
                />
                {v.caption && (
                  <figcaption className="text-xs italic text-vellum-dim px-1">
                    {v.caption}
                  </figcaption>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs text-blood-bright hover:text-blood-bright/80 hover:bg-blood/10"
                  onClick={() => setConfirmDeleteId(v.id)}
                >
                  Obriši
                </Button>
              </figure>
            ))}
          </div>
        </section>
      )}

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}
        title="Obrisati verziju karte?"
        description="Ovo trajno uklanja ovu prethodnu verziju. Trenutna karta ostaje netaknuta."
        destructive
        confirmText="Obriši"
        onConfirm={() => { if (confirmDeleteId) handleDelete(confirmDeleteId); }}
      />
    </div>
  );
}

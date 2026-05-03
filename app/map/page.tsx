'use client';
import Image from 'next/image';
import { useCurrentMap } from '@/lib/hooks/useCurrentMap';
import { useMapVersions } from '@/lib/hooks/useMapVersions';
import { MapDisplay } from '@/components/map/MapDisplay';
import { PageHeader } from '@/components/shared/PageHeader';

export default function MapPage() {
  const { data: current, isLoading } = useCurrentMap();
  const { data: versions = [] } = useMapVersions();
  const past = versions.filter(v => !v.isCurrent);

  return (
    <div className="px-6 md:px-10 py-10 max-w-5xl mx-auto">
      <PageHeader eyebrow="Poznate zemlje" title="Karta svijeta" />
      {isLoading ? (
        <div className="text-vellum-dim italic">Razmotam pergament…</div>
      ) : current ? (
        <MapDisplay map={current} />
      ) : (
        <div className="text-vellum-dim italic py-12 text-center panel rounded-sm">
          Karta još nije iscrtana.
        </div>
      )}
      {past.length > 0 && (
        <section className="mt-12">
          <h2 className="section-title mb-4 flex items-center gap-3">
            <span>Ranije skice</span>
            <span className="h-px flex-1 bg-gold-dim/30" />
          </h2>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
            {past.map(v => (
              <figure key={v.id} className="panel rounded-sm p-2">
                <Image
                  src={v.imageUrl}
                  alt={v.caption ?? ''}
                  width={300}
                  height={200}
                  className="rounded-sm w-full h-auto"
                />
                {v.caption && (
                  <figcaption className="text-xs text-vellum-dim italic mt-2 px-1">
                    {v.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

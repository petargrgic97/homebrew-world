import Image from 'next/image';
import type { MapVersion } from '@/lib/types';

export function MapDisplay({
  map,
  framed = true,
}: {
  map: MapVersion;
  framed?: boolean;
}) {
  return (
    <figure className={framed ? 'panel rounded-sm p-3' : ''}>
      <div className="relative overflow-hidden rounded-sm ring-1 ring-gold-dim/30">
        <Image
          src={map.imageUrl}
          alt={map.caption ?? 'World map'}
          width={1600}
          height={1000}
          className="w-full h-auto"
        />
      </div>
      {map.caption && (
        <figcaption className="text-center mt-3 text-vellum-dim italic text-sm">
          — {map.caption} —
        </figcaption>
      )}
    </figure>
  );
}

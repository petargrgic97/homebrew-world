import Link from 'next/link';
import Image from 'next/image';
import type { Location } from '@/lib/types';

export function LocationCard({
  location, basePath = '/locations',
}: { location: Location; basePath?: string }) {
  return (
    <Link
      href={`${basePath}/${location.id}`}
      className="card-hover panel rounded-sm overflow-hidden block group"
    >
      <div className="relative aspect-4/3 overflow-hidden">
        {location.imageUrl ? (
          <Image
            src={location.imageUrl}
            alt={location.name}
            width={600}
            height={450}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-surface-elev to-ink-deep flex items-center justify-center">
            <span className="display text-gold-dim/40 text-3xl">✦</span>
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-ink-deep/80 via-ink-deep/10 to-transparent" />
      </div>
      <div className="p-4 border-t border-border">
        <div className="display text-[0.6rem] tracking-[0.4em] uppercase text-gold-dim mb-1">
          location
        </div>
        <h3 className="display font-semibold text-vellum text-lg leading-tight">
          {location.name}
        </h3>
      </div>
    </Link>
  );
}

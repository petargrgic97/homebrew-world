import Link from 'next/link';
import type { Plot } from '@/lib/types';

const statusStyle: Record<Plot['status'], string> = {
  active: 'text-emerald-300/90',
  resolved: 'text-vellum-dim/70',
  dormant: 'text-amber-300/90',
};

export function PlotCard({ plot }: { plot: Plot }) {
  return (
    <Link
      href={`/dm/plots/${plot.id}`}
      className="card-hover panel rounded-sm p-4 block group"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="display text-[0.6rem] tracking-[0.4em] uppercase text-gold-dim">
          scheme
        </div>
        <span className={`seal ${statusStyle[plot.status]}`}>{plot.status}</span>
      </div>
      <h3 className="display font-semibold text-vellum text-lg leading-tight mb-3">
        {plot.title}
      </h3>
      <div className="text-xs italic text-vellum-dim flex flex-wrap gap-x-3 gap-y-1">
        {(plot.pcIds?.length ?? 0) > 0 && (
          <>
            <span>{plot.pcIds.length} {plot.pcIds.length === 1 ? 'hero' : 'heroes'}</span>
            <span className="text-gold-dim/50">·</span>
          </>
        )}
        <span>{(plot.npcIds?.length ?? 0)} {(plot.npcIds?.length ?? 0) === 1 ? 'soul' : 'souls'}</span>
        <span className="text-gold-dim/50">·</span>
        <span>{(plot.locationIds?.length ?? 0)} {(plot.locationIds?.length ?? 0) === 1 ? 'place' : 'places'}</span>
      </div>
    </Link>
  );
}

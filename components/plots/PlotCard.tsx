import Link from 'next/link';
import type { Plot } from '@/lib/types';
import { plotStatusLabel } from '@/lib/i18n';

function pluralCroatian(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

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
          spletka
        </div>
        <span className={`seal ${statusStyle[plot.status]}`}>{plotStatusLabel[plot.status]}</span>
      </div>
      <h3 className="display font-semibold text-vellum text-lg leading-tight mb-3">
        {plot.title}
      </h3>
      <div className="text-xs italic text-vellum-dim flex flex-wrap gap-x-3 gap-y-1">
        {(plot.pcIds?.length ?? 0) > 0 && (
          <>
            <span>{plot.pcIds.length} {pluralCroatian(plot.pcIds.length, 'heroj', 'heroja', 'heroja')}</span>
            <span className="text-gold-dim/50">·</span>
          </>
        )}
        <span>{(plot.npcIds?.length ?? 0)} {pluralCroatian(plot.npcIds?.length ?? 0, 'lik', 'lika', 'likova')}</span>
        <span className="text-gold-dim/50">·</span>
        <span>{(plot.locationIds?.length ?? 0)} {pluralCroatian(plot.locationIds?.length ?? 0, 'mjesto', 'mjesta', 'mjesta')}</span>
      </div>
    </Link>
  );
}

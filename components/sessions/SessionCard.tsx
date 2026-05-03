import Link from 'next/link';
import type { Session, CampaignEvent } from '@/lib/types';

function romanize(num: number): string {
  const numerals: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let n = num;
  let out = '';
  for (const [v, s] of numerals) {
    while (n >= v) { out += s; n -= v; }
  }
  return out || '·';
}

interface Props {
  session: Session;
  basePath?: string;
  events?: CampaignEvent[];
}

export function SessionCard({
  session, basePath = '/sessions', events,
}: Props) {
  return (
    <Link
      href={`${basePath}/${session.id}`}
      className="card-hover panel rounded-sm p-4 group flex flex-col gap-3"
    >
      <div className="flex gap-4 items-center">
        <div className="shrink-0 w-14 h-14 flex flex-col items-center justify-center border border-gold-dim/30 rounded-sm bg-ink-deep/40">
          <div className="display text-[0.55rem] tracking-[0.3em] uppercase text-gold-dim leading-none">
            ses.
          </div>
          <div className="display-decorative text-gold text-lg leading-none mt-1">
            {romanize(session.number)}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          {session.date && (
            <div className="display text-[0.6rem] tracking-[0.35em] uppercase text-gold-dim mb-0.5">
              {session.date}
            </div>
          )}
          <div className="display font-semibold text-vellum truncate">
            {session.title || `Sesija ${session.number}`}
          </div>
        </div>
      </div>

      {events && events.length > 0 && (
        <ul className="border-t border-gold-dim/15 pt-2 space-y-0.5 text-sm text-vellum-dim/90">
          {events.map(e => (
            <li key={e.id} className="flex items-baseline gap-2">
              <span className="text-gold-dim/60 shrink-0">·</span>
              <span className="truncate">{e.title}</span>
            </li>
          ))}
        </ul>
      )}
    </Link>
  );
}

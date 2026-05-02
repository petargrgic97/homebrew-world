import Link from 'next/link';
import type { Session } from '@/lib/types';

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

export function SessionCard({
  session, basePath = '/sessions',
}: { session: Session; basePath?: string }) {
  return (
    <Link
      href={`${basePath}/${session.id}`}
      className="card-hover panel rounded-sm flex gap-4 p-4 items-center group"
    >
      <div className="shrink-0 w-14 h-14 flex flex-col items-center justify-center border border-gold-dim/30 rounded-sm bg-ink-deep/40">
        <div className="display text-[0.55rem] tracking-[0.3em] uppercase text-gold-dim leading-none">
          ses.
        </div>
        <div className="display-decorative text-gold text-lg leading-none mt-1">
          {romanize(session.number)}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="display text-[0.6rem] tracking-[0.35em] uppercase text-gold-dim mb-0.5">
          {session.date}
        </div>
        <div className="display font-semibold text-vellum truncate">
          {session.title || `Session ${session.number}`}
        </div>
      </div>
    </Link>
  );
}

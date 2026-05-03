'use client';
import Link from 'next/link';
import type { CampaignEvent } from '@/lib/types';
import { Markdown } from '@/components/shared/Markdown';
import { useNpcs } from '@/lib/hooks/useNpcs';
import { usePcs } from '@/lib/hooks/usePcs';
import { useLocations } from '@/lib/hooks/useLocations';

interface Props {
  events: CampaignEvent[];
  dmEditable?: boolean;
}

export function EventTimeline({ events, dmEditable }: Props) {
  const { data: npcs = [] } = useNpcs();
  const { data: pcs = [] } = usePcs();
  const { data: locations = [] } = useLocations();

  const npcMap = new Map(npcs.map(n => [n.id, n]));
  const pcMap = new Map(pcs.map(p => [p.id, p]));
  const locationMap = new Map(locations.map(l => [l.id, l]));

  const basePrefix = dmEditable ? '/dm' : '';

  if (events.length === 0) return null;
  return (
    <ol className="relative space-y-6 pl-6">
      <span className="absolute left-1.5 top-2 bottom-2 w-px bg-linear-to-b from-gold-dim/10 via-gold-dim/40 to-gold-dim/10" />
      {events.map(e => {
        const linkedNpcs = (e.npcIds ?? [])
          .map(id => npcMap.get(id))
          .filter((n): n is NonNullable<typeof n> => !!n);
        const linkedPcs = (e.pcIds ?? [])
          .map(id => pcMap.get(id))
          .filter((p): p is NonNullable<typeof p> => !!p);
        const location = e.locationId ? locationMap.get(e.locationId) : null;
        const hasTags = location || linkedNpcs.length || linkedPcs.length;

        return (
          <li key={e.id} className="relative">
            <span
              className="absolute -left-5 top-2.5 w-3 h-3 rounded-full bg-gold ring-2 ring-ink-deep"
              style={{ boxShadow: '0 0 12px var(--gold)' }}
            />
            <div className="flex items-baseline justify-between gap-3 mb-1">
              <div className="flex items-baseline gap-3 min-w-0">
                {e.occurredAt && (
                  <>
                    <span className="display text-[0.65rem] tracking-[0.3em] uppercase text-gold-dim shrink-0">
                      {e.occurredAt}
                    </span>
                    <span className="hidden sm:inline text-gold-dim/40 select-none">·</span>
                  </>
                )}
                <h3 className="display font-semibold text-vellum text-base truncate">
                  {e.title}
                </h3>
              </div>
              {dmEditable && (
                <Link
                  href={`/dm/events/${e.id}/edit`}
                  className="text-[0.65rem] tracking-[0.3em] uppercase display text-gold-dim hover:text-gold shrink-0"
                >
                  uredi
                </Link>
              )}
            </div>

            <Markdown>{e.description}</Markdown>

            {hasTags && (
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-vellum-dim">
                {location && (
                  <span>
                    <span className="display tracking-[0.2em] uppercase text-[0.6rem] text-gold-dim mr-1.5">na</span>
                    <Link
                      href={`${basePrefix}/locations/${location.id}`}
                      className="text-gold-bright hover:text-gold underline decoration-gold-dim/40 underline-offset-2"
                    >
                      {location.name}
                    </Link>
                  </span>
                )}
                {linkedPcs.length > 0 && (
                  <span>
                    <span className="display tracking-[0.2em] uppercase text-[0.6rem] text-gold-dim mr-1.5">heroji</span>
                    {linkedPcs.map((p, i) => (
                      <span key={p.id}>
                        {i > 0 && <span className="text-gold-dim/40">, </span>}
                        <Link
                          href={`${basePrefix}/pcs/${p.id}`}
                          className="text-gold-bright hover:text-gold underline decoration-gold-dim/40 underline-offset-2"
                        >
                          {p.name}
                        </Link>
                      </span>
                    ))}
                  </span>
                )}
                {linkedNpcs.length > 0 && (
                  <span>
                    <span className="display tracking-[0.2em] uppercase text-[0.6rem] text-gold-dim mr-1.5">likovi</span>
                    {linkedNpcs.map((n, i) => (
                      <span key={n.id}>
                        {i > 0 && <span className="text-gold-dim/40">, </span>}
                        <Link
                          href={`${basePrefix}/npcs/${n.id}`}
                          className="text-gold-bright hover:text-gold underline decoration-gold-dim/40 underline-offset-2"
                        >
                          {n.name}
                        </Link>
                      </span>
                    ))}
                  </span>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

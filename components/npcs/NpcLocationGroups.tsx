import Link from 'next/link';
import { NpcCard } from '@/components/npcs/NpcCard';
import type { Npc, Location } from '@/lib/types';

interface Props {
  npcs: Npc[];
  locations: Location[];
  basePath?: string;
  locationBasePath?: string;
}

const NO_LOCATION = '__no_location__';

export function NpcLocationGroups({
  npcs, locations, basePath = '/npcs', locationBasePath = '/locations',
}: Props) {
  const locationById = new Map(locations.map(l => [l.id, l]));

  const groups = new Map<string, Npc[]>();
  for (const npc of npcs) {
    const key = npc.locationId && locationById.has(npc.locationId)
      ? npc.locationId
      : NO_LOCATION;
    const list = groups.get(key) ?? [];
    list.push(npc);
    groups.set(key, list);
  }

  const orderedLocationIds = [
    ...locations.filter(l => groups.has(l.id)).map(l => l.id),
    ...(groups.has(NO_LOCATION) ? [NO_LOCATION] : []),
  ];

  if (orderedLocationIds.length === 0) {
    return <div className="text-vellum-dim italic">No NPCs match.</div>;
  }

  return (
    <div className="space-y-10">
      {orderedLocationIds.map(key => {
        const list = groups.get(key) ?? [];
        const location = key === NO_LOCATION ? null : locationById.get(key) ?? null;
        return (
          <section key={key}>
            <div className="mb-4 flex items-baseline gap-3">
              {location ? (
                <Link
                  href={`${locationBasePath}/${location.id}`}
                  className="display text-sm tracking-[0.25em] uppercase text-gold hover:text-gold-bright"
                >
                  {location.name}
                </Link>
              ) : (
                <span className="display text-sm tracking-[0.25em] uppercase text-vellum-dim">
                  unattached
                </span>
              )}
              <span className="h-px flex-1 bg-gold-dim/30" />
              <span className="display text-[0.65rem] tracking-[0.3em] uppercase text-vellum-dim">
                {list.length}
              </span>
            </div>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {list.map(n => (
                <NpcCard key={n.id} npc={n} basePath={basePath} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

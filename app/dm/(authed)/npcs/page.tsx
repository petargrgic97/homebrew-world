'use client';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { useNpcs } from '@/lib/hooks/useNpcs';
import { useLocations } from '@/lib/hooks/useLocations';
import { NpcFilters } from '@/components/npcs/NpcFilters';
import { NpcLocationGroups } from '@/components/npcs/NpcLocationGroups';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import type { NpcStatus } from '@/lib/types';

export default function DMNpcsPage() {
  const { data: npcs = [], isLoading } = useNpcs();
  const { data: locations = [] } = useLocations();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<NpcStatus | 'all'>('all');
  const [faction, setFaction] = useState<string | 'all'>('all');

  const filtered = useMemo(
    () =>
      npcs.filter(
        n =>
          (status === 'all' || n.status === status) &&
          (faction === 'all' || n.faction === faction) &&
          (query === '' || n.name.toLowerCase().includes(query.toLowerCase())),
      ),
    [npcs, query, status, faction],
  );

  return (
    <div className="px-6 md:px-10 py-10 max-w-6xl mx-auto">
      <PageHeader
        eyebrow="Dramatis Personae"
        title="NPCs"
        actions={
          <Button asChild>
            <Link href="/dm/npcs/new">+ Inscribe NPC</Link>
          </Button>
        }
      />
      {isLoading ? (
        <div className="text-vellum-dim italic">Loading…</div>
      ) : npcs.length === 0 ? (
        <div className="text-vellum-dim italic py-12 text-center panel rounded-sm">
          No souls inscribed yet.
        </div>
      ) : (
        <>
          <NpcFilters
            npcs={npcs}
            query={query} setQuery={setQuery}
            status={status} setStatus={setStatus}
            faction={faction} setFaction={setFaction}
          />
          <NpcLocationGroups
            npcs={filtered}
            locations={locations}
            basePath="/dm/npcs"
            locationBasePath="/dm/locations"
          />
        </>
      )}
    </div>
  );
}
